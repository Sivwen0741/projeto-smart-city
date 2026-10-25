import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { io, Socket } from 'socket.io-client';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CAMINHO_TEMPO_REAL } from '../src/tempo-real/tempo-real.gateway';
import { criarApp, criarUsuario, entrar, UsuarioDeTeste } from './apoio';

describe('US04 reconhecer um alerta e registrar a providência', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let usuario: UsuarioDeTeste;
  let token: string;
  let url: string;
  let dispositivoId: string;

  const http = () => request(app.getHttpServer());
  const reconhecer = (id: string, corpo: object, comToken = token) =>
    http().post(`/api/alertas/${id}/reconhecimento`).set('Authorization', `Bearer ${comToken}`).send(corpo);

  // uma regra por alerta: só pode haver um alerta ativo por regra e dispositivo (TT02-6)
  async function alerta(situacao = 'aberto') {
    const [{ id: regraId }] = await fonte.query(
      `INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade, ativa)
       VALUES ($1, 'nivel_agua', '>', 3.5, 0, 'grave', false) RETURNING id::text`,
      [`Regra ${randomUUID()}`],
    );
    const [{ id }] = await fonte.query(
      `INSERT INTO alerta (regra_alerta_id, dispositivo_id, valor_observado, operador, valor_limite, criticidade, situacao, data_encerramento)
       VALUES ($1, $2, 3.81, '>', 3.5, 'grave', $3::varchar, CASE WHEN $3::varchar = 'encerrado' THEN now() END) RETURNING id::text`,
      [regraId, dispositivoId, situacao],
    );
    return id as string;
  }

  const lido = async (id: string) =>
    (
      await fonte.query(
        `SELECT situacao, usuario_reconhecimento_id::text AS usuario, data_reconhecimento, providencia FROM alerta WHERE id = $1`,
        [id],
      )
    )[0];

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    await app.listen(0);
    url = `http://127.0.0.1:${app.getHttpServer().address().port}`;
    usuario = await criarUsuario(fonte);
    token = await entrar(app, usuario);
    [{ id: dispositivoId }] = await fonte.query(
      `INSERT INTO dispositivo (identificador, tipo_dispositivo_id, localizacao, atributos_especificos)
       SELECT $1, id, (SELECT ST_PointOnSurface(area)::geography FROM bairro WHERE nome = 'Olarias'), '{"tipoGrandeza": "nivel_agua"}'
         FROM tipo_dispositivo WHERE nome = 'Sensor de nível' RETURNING id::text`,
      [`U4-${randomUUID().slice(0, 8)}`],
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  it('US04-1 o reconhecimento exige a providência adotada', async () => {
    const id = await alerta();
    for (const corpo of [{}, { providencia: '' }, { providencia: '   ' }, { providencia: 42 }]) {
      const resposta = await reconhecer(id, corpo).expect(400);
      expect(resposta.body.message).toContain('Informe a providência adotada.');
    }
    expect((await lido(id)).situacao).toBe('aberto');
  });

  it('US04-2 grava o usuário, a data e a hora e a providência, e o alerta passa a em atendimento', async () => {
    const id = await alerta();
    const antes = Date.now();
    const resposta = await reconhecer(id, { providencia: '  Defesa Civil acionada por telefone.  ' }).expect(200);
    expect(resposta.body).toMatchObject({ id, situacao: 'em_atendimento', reconhecidoPor: 'Usuário de teste', providencia: 'Defesa Civil acionada por telefone.' });
    const gravado = await lido(id);
    expect(gravado).toMatchObject({ situacao: 'em_atendimento', usuario: usuario.id, providencia: 'Defesa Civil acionada por telefone.' });
    expect(new Date(gravado.data_reconhecimento).getTime()).toBeGreaterThanOrEqual(antes - 1000);
  });

  describe('US04-3 um alerta só é reconhecido uma vez', () => {
    it('US04-3 a segunda tentativa é recusada com a mensagem de quem reconheceu e quando', async () => {
      const id = await alerta();
      await reconhecer(id, { providencia: 'Primeira providência.' }).expect(200);
      const outro = await entrar(app, await criarUsuario(fonte));
      const resposta = await reconhecer(id, { providencia: 'Segunda providência.' }, outro).expect(409);
      expect(resposta.body.message).toMatch(/^Este alerta já foi reconhecido por Usuário de teste às \d{2}:\d{2}\. A sua providência não foi gravada\.$/);
      expect(resposta.body.alerta).toMatchObject({ id, providencia: 'Primeira providência.' });
      expect((await lido(id)).providencia).toBe('Primeira providência.');
    });

    it('US04-3 duas tentativas simultâneas: só uma é aceita', async () => {
      const id = await alerta();
      const outros = await Promise.all([1, 2, 3, 4].map(async () => entrar(app, await criarUsuario(fonte))));
      const respostas = await Promise.all(outros.map((t, i) => reconhecer(id, { providencia: `Providência ${i}` }, t)));
      expect(respostas.map((r) => r.status).sort()).toEqual([200, 409, 409, 409]);
      const [{ registros }] = await fonte.query(
        `SELECT count(*)::int AS registros FROM log_atividade WHERE acao = 'reconhecimento_alerta' AND entidade_id = $1`,
        [id],
      );
      expect(registros).toBe(1);
    });

    it('US04-3 alerta encerrado ou inexistente não é reconhecido', async () => {
      const encerrado = await alerta('encerrado');
      expect((await reconhecer(encerrado, { providencia: 'Tarde demais.' }).expect(409)).body.message).toBe(
        'Este alerta já foi encerrado. A sua providência não foi gravada.',
      );
      await reconhecer('999999999', { providencia: 'Nada.' }).expect(404);
      await reconhecer('abc', { providencia: 'Nada.' }).expect(404);
    });
  });

  it('US04-4 o reconhecimento gera registro no log de atividades', async () => {
    const id = await alerta();
    await reconhecer(id, { providencia: 'Equipe a caminho.' }).expect(200);
    const registros = await fonte.query(
      `SELECT usuario_id::text AS usuario, entidade_afetada, detalhes FROM log_atividade WHERE acao = 'reconhecimento_alerta' AND entidade_id = $1`,
      [id],
    );
    expect(registros).toEqual([{ usuario: usuario.id, entidade_afetada: 'alerta', detalhes: { providencia: 'Equipe a caminho.' } }]);
  });

  it('US03-2 o reconhecimento feito por um operador chega aos outros em tempo real', async () => {
    const id = await alerta();
    const outro: Socket = io(url, { path: CAMINHO_TEMPO_REAL, auth: { token }, transports: ['websocket'], reconnection: false });
    await new Promise<void>((resolver, rejeitar) => {
      outro.once('connect', () => resolver());
      outro.once('connect_error', rejeitar);
    });
    const recebido = new Promise<{ id: string; situacao: string }>((resolver) =>
      outro.on('alerta:atualizado', (a: { id: string; situacao: string }) => a.id === id && resolver(a)),
    );
    await reconhecer(id, { providencia: 'Confirmado pela câmera.' }).expect(200);
    expect(await recebido).toMatchObject({ id, situacao: 'em_atendimento' });
    outro.disconnect();
  });
});

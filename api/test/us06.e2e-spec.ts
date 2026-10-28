import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { io } from 'socket.io-client';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CAMINHO_TEMPO_REAL } from '../src/tempo-real/tempo-real.gateway';
import { criarApp, criarUsuario, entrar, UsuarioDeTeste } from './apoio';

describe('US06 atualizar a situação de uma ocorrência até a resolução', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let usuario: UsuarioDeTeste;
  let token: string;
  let url: string;
  let ponto: { latitude: number; longitude: number };

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  const registrar = async (extra: object = {}) =>
    (
      await autenticado(http().post('/api/ocorrencias'))
        .send({ categoria: 'Alagamento', criticidade: 'grave', descricao: 'Água na calçada.', ...ponto, endereco: 'Rua Ermelino de Leão, 302', ...extra })
        .expect(201)
    ).body;
  const providencia = (id: string, corpo: object) => autenticado(http().post(`/api/ocorrencias/${id}/providencias`)).send(corpo);
  const listar = async (visao?: string) =>
    (await autenticado(http().get(`/api/ocorrencias${visao ? `?visao=${visao}` : ''}`)).expect(200)).body as { id: string; situacao: string }[];
  const detalhe = async (id: string) => (await autenticado(http().get(`/api/ocorrencias/${id}`)).expect(200)).body;

  async function alertaVinculado(ocorrenciaId: string, situacao: 'em_atendimento' | 'aberto') {
    const [{ id: regraId }] = await fonte.query(
      `INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade, ativa)
       VALUES ($1, 'nivel_agua', '>', 3.5, 0, 'grave', false) RETURNING id::text`,
      [`Regra ${randomUUID()}`],
    );
    const [{ id }] = await fonte.query(
      `INSERT INTO alerta (regra_alerta_id, dispositivo_id, ocorrencia_id, valor_observado, operador, valor_limite, criticidade, situacao,
                           data_hora, usuario_reconhecimento_id, data_reconhecimento, providencia)
       VALUES ($1, (SELECT id FROM dispositivo ORDER BY id LIMIT 1), $2, 3.81, '>', 3.5, 'grave', $3::varchar,
               now() - interval '10 minutes', $4, CASE WHEN $3::varchar = 'em_atendimento' THEN now() - interval '5 minutes' END,
               CASE WHEN $3::varchar = 'em_atendimento' THEN 'Confirmado pela câmera.' END)
       RETURNING id::text`,
      [regraId, ocorrenciaId, situacao, usuario.id],
    );
    return id as string;
  }

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    await app.listen(0);
    url = `http://127.0.0.1:${app.getHttpServer().address().port}`;
    usuario = await criarUsuario(fonte);
    token = await entrar(app, usuario);
    [ponto] = await fonte.query(
      `SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE nome = 'Centro'`,
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US06-1 a lista traz os dados de cada ocorrência, abertas e em atendimento primeiro', () => {
    it('US06-1 cada ocorrência tem protocolo, gravidade, categoria, bairro, órgão, situação e abertura', async () => {
      const criada = await registrar();
      const item = (await listar()).find((o) => o.id === criada.id);
      expect(item).toMatchObject({
        protocolo: criada.protocolo,
        criticidade: 'grave',
        categoria: 'Alagamento',
        bairro: 'Centro',
        situacao: 'aberta',
        dataAbertura: expect.any(String),
        dataEncerramento: null,
      });
      expect(item).toHaveProperty('orgao');
    });

    it('US06-1 em andamento, abertas vêm antes das em atendimento; depois a mais grave e a mais antiga', async () => {
      await fonte.query(`UPDATE ocorrencia SET situacao = 'encerrada', data_encerramento = now() WHERE situacao <> 'encerrada'`);
      const atencao = await registrar({ criticidade: 'atencao' });
      const graveAntiga = await registrar();
      const graveNova = await registrar();
      const emAtendimento = await registrar();
      await fonte.query(`UPDATE ocorrencia SET data_abertura = now() - interval '2 hours' WHERE id = $1`, [graveAntiga.id]);
      await providencia(emAtendimento.id, { observacao: 'Equipe a caminho.' }).expect(200);
      expect((await listar()).map((o) => o.id)).toEqual([graveAntiga.id, graveNova.id, atencao.id, emAtendimento.id]);
    });

    it('US06-1 visão inválida é recusada', async () => {
      await autenticado(http().get('/api/ocorrencias?visao=todas')).expect(400);
    });
  });

  describe('US06-2 o detalhe traz os dados, os alertas vinculados e o histórico em ordem cronológica', () => {
    it('US06-2 o histórico junta a geração e o reconhecimento do alerta com os registros do atendimento', async () => {
      const criada = await registrar({ descricao: 'Nível do arroio acima da cota.' });
      const alertaId = await alertaVinculado(criada.id, 'em_atendimento');
      await providencia(criada.id, { observacao: 'Encaminhado à Defesa Civil.' }).expect(200);
      const d = await detalhe(criada.id);
      expect(d).toMatchObject({ protocolo: criada.protocolo, descricao: 'Nível do arroio acima da cota.', bairro: 'Centro', responsavel: 'Usuário de teste' });
      expect(d.alertas).toEqual([expect.objectContaining({ id: alertaId, dispositivo: expect.any(String), valorObservado: 3.81, unidade: 'm' })]);
      expect(d.historico.map((h: { tipo: string; situacaoNova: string | null }) => [h.tipo, h.situacaoNova])).toEqual([
        ['alerta_gerado', null],
        ['alerta_reconhecido', null],
        ['ocorrencia', 'aberta'],
        ['ocorrencia', 'em_atendimento'],
      ]);
      const instantes = d.historico.map((h: { dataHora: string }) => new Date(h.dataHora).getTime());
      expect(instantes).toEqual([...instantes].sort((a, b) => a - b));
    });

    it('US06-2 ocorrência inexistente responde 404', async () => {
      await autenticado(http().get('/api/ocorrencias/999999999')).expect(404);
      await autenticado(http().get('/api/ocorrencias/abc')).expect(404);
    });
  });

  describe('US06-3 o operador registra providências e muda a situação, e tudo entra no histórico', () => {
    it('US06-3 a primeira providência de uma ocorrência aberta passa para em atendimento', async () => {
      const criada = await registrar();
      const atualizada = (await providencia(criada.id, { observacao: 'Equipe acionada por telefone.' }).expect(200)).body;
      expect(atualizada.situacao).toBe('em_atendimento');
      const ultima = (await detalhe(criada.id)).historico.at(-1);
      expect(ultima).toMatchObject({
        tipo: 'ocorrencia',
        situacaoAnterior: 'aberta',
        situacaoNova: 'em_atendimento',
        observacao: 'Equipe acionada por telefone.',
        autor: 'Usuário de teste',
        dataHora: expect.any(String),
      });
    });

    it('US06-3 providência em atendimento mantém a situação e também entra no histórico', async () => {
      const criada = await registrar();
      await providencia(criada.id, { observacao: 'Equipe a caminho.' }).expect(200);
      expect((await providencia(criada.id, { observacao: 'Via interditada.' }).expect(200)).body.situacao).toBe('em_atendimento');
      const registros = (await detalhe(criada.id)).historico.filter((h: { tipo: string }) => h.tipo === 'ocorrencia');
      expect(registros.map((h: { observacao: string }) => h.observacao)).toEqual([
        'Ocorrência registrada a partir de ligação telefônica.',
        'Equipe a caminho.',
        'Via interditada.',
      ]);
    });

    it('US06-3 providência vazia ou situação inválida é recusada', async () => {
      const criada = await registrar();
      expect((await providencia(criada.id, { observacao: '   ' }).expect(400)).body.message).toContain('Escreva a providência.');
      await providencia(criada.id, { observacao: 'ok', situacao: 'aberta' }).expect(400);
      await providencia('999999999', { observacao: 'ok' }).expect(404);
    });
  });

  describe('US06-4 encerrar exige observação, grava a data e encerra os alertas em atendimento', () => {
    it('US06-4 sem observação o encerramento é recusado', async () => {
      const criada = await registrar();
      await providencia(criada.id, { situacao: 'encerrada' }).expect(400);
      expect((await detalhe(criada.id)).situacao).toBe('aberta');
    });

    it('US06-4 encerrar grava a data e encerra só os alertas vinculados em atendimento', async () => {
      const criada = await registrar();
      const emAtendimento = await alertaVinculado(criada.id, 'em_atendimento');
      const aberto = await alertaVinculado(criada.id, 'aberto');
      const encerrada = (await providencia(criada.id, { observacao: 'Água baixou; via liberada.', situacao: 'encerrada' }).expect(200)).body;
      expect(encerrada).toMatchObject({ situacao: 'encerrada', dataEncerramento: expect.any(String) });
      const alertas = await fonte.query(`SELECT id::text, situacao, data_encerramento IS NOT NULL AS encerrado FROM alerta WHERE ocorrencia_id = $1 ORDER BY id`, [criada.id]);
      expect(alertas).toEqual([
        { id: emAtendimento, situacao: 'encerrado', encerrado: true },
        { id: aberto, situacao: 'aberto', encerrado: false },
      ]);
    });

    it('US06-4 ocorrência encerrada não aceita outra atualização', async () => {
      const criada = await registrar();
      await providencia(criada.id, { observacao: 'Resolvido.', situacao: 'encerrada' }).expect(200);
      const resposta = await providencia(criada.id, { observacao: 'De novo.' }).expect(409);
      expect(resposta.body.message).toBe(`A ocorrência ${criada.protocolo} já foi encerrada.`);
    });
  });

  it('US06-5 a encerrada sai da lista em andamento e do mapa, e continua consultável', async () => {
    const criada = await registrar();
    await providencia(criada.id, { observacao: 'Resolvido.', situacao: 'encerrada' }).expect(200);
    expect((await listar()).map((o) => o.id)).not.toContain(criada.id);
    expect((await listar('andamento')).map((o) => o.id)).not.toContain(criada.id);
    expect((await listar('encerradas')).map((o) => o.id)).toContain(criada.id);
    expect((await detalhe(criada.id)).situacao).toBe('encerrada');
  });

  describe('US06-6 cada atualização vai para o log e aparece em tempo real', () => {
    it('US06-6 providência e encerramento geram registros no log de atividades', async () => {
      const criada = await registrar();
      await providencia(criada.id, { observacao: 'Equipe a caminho.' }).expect(200);
      await providencia(criada.id, { observacao: 'Resolvido.', situacao: 'encerrada' }).expect(200);
      const registros = await fonte.query(
        `SELECT acao, usuario_id::text AS usuario, detalhes FROM log_atividade
          WHERE entidade_afetada = 'ocorrencia' AND entidade_id = $1 AND acao <> 'registro_ocorrencia' ORDER BY id`,
        [criada.id],
      );
      expect(registros).toEqual([
        { acao: 'atualizacao_ocorrencia', usuario: usuario.id, detalhes: { protocolo: criada.protocolo, situacaoAnterior: 'aberta', situacaoNova: 'em_atendimento', alertasEncerrados: [] } },
        { acao: 'encerramento_ocorrencia', usuario: usuario.id, detalhes: { protocolo: criada.protocolo, situacaoAnterior: 'em_atendimento', situacaoNova: 'encerrada', alertasEncerrados: [] } },
      ]);
    });

    it('US06-6 a atualização e o alerta encerrado chegam às outras telas', async () => {
      const criada = await registrar();
      const alertaId = await alertaVinculado(criada.id, 'em_atendimento');
      const socket = io(url, { path: CAMINHO_TEMPO_REAL, auth: { token }, transports: ['websocket'], reconnection: false });
      await new Promise<void>((resolver, rejeitar) => {
        socket.once('connect', () => resolver());
        socket.once('connect_error', rejeitar);
      });
      const ocorrencia = new Promise<{ id: string; situacao: string }>((resolver) => socket.once('ocorrencia:atualizada', resolver));
      const alerta = new Promise<{ id: string; situacao: string }>((resolver) =>
        socket.on('alerta:atualizado', (a: { id: string; situacao: string }) => a.id === alertaId && resolver(a)),
      );
      await providencia(criada.id, { observacao: 'Resolvido.', situacao: 'encerrada' }).expect(200);
      expect(await ocorrencia).toMatchObject({ id: criada.id, situacao: 'encerrada' });
      expect(await alerta).toMatchObject({ id: alertaId, situacao: 'encerrado' });
      socket.disconnect();
    });
  });
});

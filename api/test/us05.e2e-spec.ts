import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { io } from 'socket.io-client';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CAMINHO_TEMPO_REAL } from '../src/tempo-real/tempo-real.gateway';
import { criarApp, criarUsuario, entrar, UsuarioDeTeste } from './apoio';

describe('US05 registrar manualmente uma ocorrência informada por telefone', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let usuario: UsuarioDeTeste;
  let token: string;
  let url: string;
  let ponto: { latitude: number; longitude: number };
  let defesaCivil: string;

  const http = () => request(app.getHttpServer());
  const registrar = (corpo: object) => http().post('/api/ocorrencias').set('Authorization', `Bearer ${token}`).send(corpo);
  const dados = (extra: object = {}) => ({
    categoria: 'Alagamento',
    criticidade: 'grave',
    orgaoId: defesaCivil,
    descricao: 'Morador informa lâmina de água sobre a faixa da direita.',
    ...ponto,
    endereco: 'Av. Visconde de Taunay, 1840',
    ...extra,
  });

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    await app.listen(0);
    url = `http://127.0.0.1:${app.getHttpServer().address().port}`;
    usuario = await criarUsuario(fonte);
    token = await entrar(app, usuario);
    [ponto] = await fonte.query(
      `SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE nome = 'Olarias'`,
    );
    const orgaos = (await http().get('/api/orgaos').set('Authorization', `Bearer ${token}`).expect(200)).body;
    defesaCivil = orgaos.find((o: { nome: string }) => o.nome === 'Defesa Civil').id;
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US05-1 o formulário recebe categoria, descrição, localização, gravidade e órgão', () => {
    it('US05-1 grava os campos e calcula o bairro pela localização', async () => {
      const criada = (await registrar(dados()).expect(201)).body;
      expect(criada).toMatchObject({
        categoria: 'Alagamento',
        criticidade: 'grave',
        orgaoId: defesaCivil,
        orgao: 'Defesa Civil',
        descricao: 'Morador informa lâmina de água sobre a faixa da direita.',
        endereco: 'Av. Visconde de Taunay, 1840',
        latitude: ponto.latitude,
        longitude: ponto.longitude,
        bairro: 'Olarias',
      });
      const [{ tipo }] = await fonte.query(`SELECT pg_typeof(localizacao)::text AS tipo FROM ocorrencia WHERE id = $1`, [criada.id]);
      expect(tipo).toBe('geography');
    });

    it('US05-1 as listas de categorias e de órgãos vêm da interface de programação', async () => {
      const categorias = (await http().get('/api/ocorrencias/categorias').set('Authorization', `Bearer ${token}`).expect(200)).body;
      expect(categorias).toEqual(['Risco hidrológico', 'Alagamento', 'Trânsito e acidente', 'Iluminação pública', 'Qualidade do ar', 'Ruído', 'Infraestrutura urbana', 'Outra']);
      const orgaos = (await http().get('/api/orgaos').set('Authorization', `Bearer ${token}`).expect(200)).body.map((o: { nome: string }) => o.nome);
      expect(orgaos).toEqual(expect.arrayContaining(['Defesa Civil', 'Mobilidade', 'Meio Ambiente', 'Infraestrutura']));
    });

    it('US05-1 ponto na zona rural fica sem bairro', async () => {
      const [rural] = await fonte.query(
        `SELECT ST_Y(p) AS latitude, ST_X(p) AS longitude
           FROM (SELECT ST_PointOnSurface(area) AS p FROM distrito WHERE nome = 'Itaiacoca') d
          WHERE NOT EXISTS (SELECT 1 FROM bairro WHERE ST_Contains(area, p))`,
      );
      expect((await registrar(dados(rural)).expect(201)).body.bairro).toBeNull();
    });
  });

  it('US05-2 o protocolo segue o formato do protótipo e é único, mesmo com registros simultâneos', async () => {
    const respostas = await Promise.all([1, 2, 3, 4, 5].map(() => registrar(dados())));
    const protocolos = respostas.map((r) => r.body.protocolo);
    expect(respostas.every((r) => r.status === 201)).toBe(true);
    const mes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).format(new Date());
    for (const p of protocolos) expect(p).toMatch(new RegExp(`^${mes}-\\d{4,}$`));
    expect(new Set(protocolos).size).toBe(5);
  });

  it('US05-3 grava quem registrou, a origem telefone, a situação aberta e o primeiro registro do histórico', async () => {
    const criada = (await registrar(dados()).expect(201)).body;
    expect(criada).toMatchObject({ origem: 'telefone', situacao: 'aberta', registradaPor: 'Usuário de teste' });
    const [{ usuario_abertura_id }] = await fonte.query(`SELECT usuario_abertura_id::text FROM ocorrencia WHERE id = $1`, [criada.id]);
    expect(usuario_abertura_id).toBe(usuario.id);
    const historico = await fonte.query(
      `SELECT usuario_id::text AS usuario, situacao_anterior, situacao_nova FROM historico_ocorrencia WHERE ocorrencia_id = $1`,
      [criada.id],
    );
    expect(historico).toEqual([{ usuario: usuario.id, situacao_anterior: null, situacao_nova: 'aberta' }]);
  });

  describe('US05-4 o cadastro é recusado sem os dados obrigatórios', () => {
    it('US05-4 sem categoria, sem gravidade ou sem localização é recusado com mensagem', async () => {
      const casos: [object, string][] = [
        [{ categoria: undefined }, 'Escolha a categoria.'],
        [{ categoria: 'Enchente' }, 'Escolha a categoria.'],
        [{ criticidade: undefined }, 'Escolha a gravidade.'],
        [{ latitude: undefined }, 'Marque a localização no mapa.'],
        [{ longitude: undefined }, 'Marque a localização no mapa.'],
        [{ orgaoId: '999999' }, 'Órgão inválido.'],
      ];
      for (const [extra, mensagem] of casos) {
        const resposta = await registrar(dados(extra)).expect(400);
        expect(resposta.body.message).toContain(mensagem);
      }
    });

    it('US05-4 ponto fora do município é recusado', async () => {
      await registrar(dados({ latitude: -23.55, longitude: -46.63 })).expect(422);
    });

    it('US05-4 órgão e descrição são opcionais', async () => {
      await registrar(dados({ orgaoId: undefined, descricao: '', endereco: undefined })).expect(201);
    });
  });

  describe('US05-5 a ocorrência pode ser aberta a partir de um alerta', () => {
    async function alerta() {
      const [{ id: regraId }] = await fonte.query(
        `INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade, ativa)
         VALUES ($1, 'nivel_agua', '>', 3.5, 0, 'grave', false) RETURNING id::text`,
        [`Regra ${randomUUID()}`],
      );
      const [{ id }] = await fonte.query(
        `INSERT INTO alerta (regra_alerta_id, dispositivo_id, valor_observado, operador, valor_limite, criticidade, situacao)
         VALUES ($1, (SELECT id FROM dispositivo ORDER BY id LIMIT 1), 3.81, '>', 3.5, 'grave', 'em_atendimento') RETURNING id::text`,
        [regraId],
      );
      return id as string;
    }

    it('US05-5 o alerta fica vinculado e a origem é alerta', async () => {
      const alertaId = await alerta();
      const criada = (await registrar(dados({ alertaId })).expect(201)).body;
      expect(criada.origem).toBe('alerta');
      const [{ ocorrencia_id }] = await fonte.query(`SELECT ocorrencia_id::text FROM alerta WHERE id = $1`, [alertaId]);
      expect(ocorrencia_id).toBe(criada.id);
      const lista = (await http().get('/api/alertas').set('Authorization', `Bearer ${token}`).expect(200)).body;
      expect(lista.find((a: { id: string }) => a.id === alertaId)).toMatchObject({ ocorrenciaId: criada.id, orgao: 'Defesa Civil' });
    });

    it('US05-5 alerta já vinculado ou inexistente não abre outra ocorrência', async () => {
      const alertaId = await alerta();
      const primeira = (await registrar(dados({ alertaId })).expect(201)).body;
      const [{ total: antes }] = await fonte.query(`SELECT count(*)::int AS total FROM ocorrencia`);
      const resposta = await registrar(dados({ alertaId })).expect(409);
      expect(resposta.body.message).toBe(`Este alerta já está vinculado à ocorrência ${primeira.protocolo}.`);
      await registrar(dados({ alertaId: '999999999' })).expect(404);
      const [{ total: depois }] = await fonte.query(`SELECT count(*)::int AS total FROM ocorrencia`);
      expect(depois).toBe(antes);
    });
  });

  describe('US05-6 o registro vai para o log e para o mapa em tempo real', () => {
    it('US05-6 o registro gera entrada no log de atividades', async () => {
      const criada = (await registrar(dados()).expect(201)).body;
      const registros = await fonte.query(
        `SELECT usuario_id::text AS usuario, detalhes FROM log_atividade WHERE acao = 'registro_ocorrencia' AND entidade_id = $1`,
        [criada.id],
      );
      expect(registros).toEqual([{ usuario: usuario.id, detalhes: { protocolo: criada.protocolo, origem: 'telefone', alertaId: null } }]);
    });

    it('US05-6 a ocorrência nova chega às telas e aparece na lista do mapa', async () => {
      const socket = io(url, { path: CAMINHO_TEMPO_REAL, auth: { token }, transports: ['websocket'], reconnection: false });
      await new Promise<void>((resolver, rejeitar) => {
        socket.once('connect', () => resolver());
        socket.once('connect_error', rejeitar);
      });
      const recebida = new Promise<{ protocolo: string }>((resolver) => socket.once('ocorrencia:nova', resolver));
      const criada = (await registrar(dados()).expect(201)).body;
      expect((await recebida).protocolo).toBe(criada.protocolo);
      socket.disconnect();
      const abertas = (await http().get('/api/ocorrencias').set('Authorization', `Bearer ${token}`).expect(200)).body;
      expect(abertas.map((o: { protocolo: string }) => o.protocolo)).toContain(criada.protocolo);
    });
  });
});

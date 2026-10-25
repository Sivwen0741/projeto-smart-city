import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { criarApp, criarUsuario, entrar } from './apoio';

describe('US01 mapa interativo com dispositivos e ocorrências', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let tipoNivel: string;
  let ponto: { latitude: number; longitude: number };

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);

  async function dispositivo(estado = 'ativo') {
    return (
      await autenticado(http().post('/api/dispositivos'))
        .send({ identificador: `U1-${randomUUID().slice(0, 8)}`, tipoDispositivoId: tipoNivel, ...ponto, estado, atributos: { tipoGrandeza: 'nivel_agua' } })
        .expect(201)
    ).body as { id: string; identificador: string };
  }

  async function alerta(dispositivoId: string, criticidade: string, situacao = 'aberto') {
    const [{ id: regraId }] = await fonte.query(
      `INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade)
       VALUES ($1, 'nivel_agua', '>', 3.5, 0, $2) RETURNING id::text`,
      [`Regra ${randomUUID()}`, criticidade],
    );
    const [{ id }] = await fonte.query(
      `INSERT INTO alerta (regra_alerta_id, dispositivo_id, valor_observado, operador, valor_limite, criticidade, situacao)
       VALUES ($1, $2, 3.81, '>', 3.5, $3, $4) RETURNING id::text`,
      [regraId, dispositivoId, criticidade, situacao],
    );
    return id as string;
  }

  async function ocorrencia(dados: { criticidade?: string; situacao?: string; encerrada?: boolean } = {}) {
    const protocolo = `T-${randomUUID().slice(0, 12)}`;
    await fonte.query(
      `INSERT INTO ocorrencia (protocolo, categoria, descricao, localizacao, bairro_id, criticidade, situacao, data_encerramento)
       VALUES ($1, 'Risco hidrológico', 'Lâmina de água na via', ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography,
               (SELECT id FROM bairro WHERE nome = 'Olarias'), $4, $5, CASE WHEN $6 THEN now() END)`,
      [protocolo, ponto.latitude, ponto.longitude, dados.criticidade ?? 'grave', dados.situacao ?? 'aberta', dados.encerrada ?? false],
    );
    return protocolo;
  }

  const lerDispositivo = async (id: string) => (await autenticado(http().get(`/api/dispositivos/${id}`)).expect(200)).body;

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    token = await entrar(app, await criarUsuario(fonte));
    [{ id: tipoNivel }] = await fonte.query(`SELECT id::text AS id FROM tipo_dispositivo WHERE nome = 'Sensor de nível'`);
    [ponto] = await fonte.query(
      `SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE nome = 'Olarias'`,
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US01-1 os dispositivos trazem posição, situação e a gravidade do alerta ativo', () => {
    it('US01-1 a cor do marcador sai da maior gravidade entre os alertas ativos', async () => {
      const d = await dispositivo();
      expect(await lerDispositivo(d.id)).toMatchObject({ latitude: ponto.latitude, longitude: ponto.longitude, alertaAtivo: null });
      await alerta(d.id, 'informativo');
      expect((await lerDispositivo(d.id)).alertaAtivo).toBe('informativo');
      await alerta(d.id, 'atencao', 'em_atendimento');
      expect((await lerDispositivo(d.id)).alertaAtivo).toBe('atencao');
      const grave = await alerta(d.id, 'grave');
      expect((await lerDispositivo(d.id)).alertaAtivo).toBe('grave');
      await fonte.query(`UPDATE alerta SET situacao = 'encerrado', data_encerramento = now() WHERE id = $1`, [grave]);
      expect((await lerDispositivo(d.id)).alertaAtivo).toBe('atencao');
    });

    it('US01-1 a listagem informa o estado, para o mapa deixar de fora os inativos', async () => {
      const inativo = await dispositivo('inativo');
      const lista = (await autenticado(http().get('/api/dispositivos')).expect(200)).body;
      expect(lista.find((d: { id: string }) => d.id === inativo.id)).toMatchObject({ estado: 'inativo', situacao: 'inativo' });
    });
  });

  describe('US01-2 as ocorrências abertas vêm com a localização', () => {
    it('US01-2 lista as não encerradas, com coordenada, e deixa de fora as encerradas', async () => {
      const aberta = await ocorrencia();
      const emAtendimento = await ocorrencia({ criticidade: 'atencao', situacao: 'em_atendimento' });
      const encerrada = await ocorrencia({ encerrada: true, situacao: 'encerrada' });
      const lista = (await autenticado(http().get('/api/ocorrencias')).expect(200)).body;
      const protocolos = lista.map((o: { protocolo: string }) => o.protocolo);
      expect(protocolos).toEqual(expect.arrayContaining([aberta, emAtendimento]));
      expect(protocolos).not.toContain(encerrada);
      expect(lista.find((o: { protocolo: string }) => o.protocolo === aberta)).toMatchObject({
        latitude: ponto.latitude,
        longitude: ponto.longitude,
        bairro: 'Olarias',
      });
    });

    it('US01-2 a listagem de ocorrências exige token', async () => {
      await http().get('/api/ocorrencias').expect(401);
    });
  });

  describe('US01-3 o resumo do marcador tem os dados de cada um', () => {
    it('US01-3 o dispositivo traz código, tipo, bairro, situação e a última leitura', async () => {
      const d = await dispositivo();
      expect((await lerDispositivo(d.id)).ultimaLeitura).toBeNull();
      await fonte.query(
        `INSERT INTO leitura (dispositivo_id, tipo_grandeza, valor, unidade, origem, data_hora)
         VALUES ($1, 'nivel_agua', 3.47, 'm', 'mqtt', now() - interval '2 minutes'), ($1, 'nivel_agua', 3.81, 'm', 'mqtt', now() - interval '1 minute')`,
        [d.id],
      );
      const lido = await lerDispositivo(d.id);
      expect(lido).toMatchObject({ identificador: d.identificador, tipo: 'Sensor de nível', bairro: 'Olarias' });
      expect(lido.situacao).toBeDefined();
      expect(lido.ultimaLeitura).toMatchObject({ grandeza: 'nivel_agua', valor: 3.81, unidade: 'm' });
    });

    it('US01-3 a ocorrência traz protocolo, categoria, gravidade e situação', async () => {
      const protocolo = await ocorrencia({ criticidade: 'atencao', situacao: 'em_atendimento' });
      const lista = (await autenticado(http().get('/api/ocorrencias')).expect(200)).body;
      expect(lista.find((o: { protocolo: string }) => o.protocolo === protocolo)).toMatchObject({
        protocolo,
        categoria: 'Risco hidrológico',
        criticidade: 'atencao',
        situacao: 'em_atendimento',
      });
    });
  });

  it('US01-4 os limites dos bairros vêm da base territorial, com o ponto do rótulo dentro de cada um', async () => {
    const colecao = (await autenticado(http().get('/api/territorio/bairros')).expect(200)).body;
    const [{ total }] = await fonte.query(`SELECT count(*)::int AS total FROM bairro`);
    expect(colecao.type).toBe('FeatureCollection');
    expect(colecao.features).toHaveLength(total);
    for (const f of colecao.features) {
      expect(['Polygon', 'MultiPolygon']).toContain(f.geometry.type);
      const [{ dentro }] = await fonte.query(
        `SELECT ST_Contains(area, ST_SetSRID(ST_MakePoint($2, $3), 4326)) AS dentro FROM bairro WHERE nome = $1`,
        [f.properties.nome, ...f.properties.rotulo],
      );
      expect(`${f.properties.nome} ${dentro}`).toBe(`${f.properties.nome} true`);
    }
  });
});

import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { IngestaoService } from '../src/ingestao/ingestao.service';
import { criarApp, criarUsuario, entrar } from './apoio';

describe('US10 alerta automático de risco de enchente', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let tipos: Record<string, string>;
  let regraId: string;
  let ingestao: IngestaoService;

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  const horasAtras = (h: number) => new Date(Date.now() - h * 3_600_000);

  async function pontoEm(bairro: string) {
    const [p] = await fonte.query(
      `SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE nome = $1`,
      [bairro],
    );
    return p as { latitude: number; longitude: number };
  }

  async function dispositivo(tipo: string, atributos: Record<string, unknown>, bairro: string) {
    const identificador = `U10-${randomUUID().slice(0, 8)}`;
    const criado = (
      await autenticado(http().post('/api/dispositivos'))
        .send({ identificador, tipoDispositivoId: tipos[tipo], ...(await pontoEm(bairro)), estado: 'ativo', atributos })
        .expect(201)
    ).body;
    return { id: criado.id as string, codigo: identificador };
  }

  const sensor = (bairro: string) => dispositivo('Sensor de nível', { tipoGrandeza: 'nivel_agua', unidadeMedida: 'm' }, bairro);
  const estacao = (bairro: string) => dispositivo('Estação ambiental', { variaveisMonitoradas: ['precipitacao'] }, bairro);
  const publicar = (codigo: string, grandeza: string, valor: number, dataHora = new Date()) =>
    ingestao.gravar(codigo, { dataHora, origem: 'mqtt', leituras: [{ grandeza: grandeza as never, valor, unidade: grandeza === 'nivel_agua' ? 'm' : 'mm' }] });

  const alertasDoRisco = (dispositivoId: string) =>
    fonte.query(`SELECT id::text AS id, situacao, composicao FROM alerta WHERE regra_alerta_id = $1 AND dispositivo_id = $2`, [regraId, dispositivoId]);

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    token = await entrar(app, await criarUsuario(fonte));
    const lista = (await autenticado(http().get('/api/tipos-dispositivo')).expect(200)).body;
    tipos = Object.fromEntries(lista.map((t: { nome: string; id: string }) => [t.nome, t.id]));
    ingestao = app.get(IngestaoService);
    // a us09 grava vazão simulada para todos os sensores de nível; aqui cada caso controla a sua
    await fonte.query(`DELETE FROM previsao`);
    await fonte.query(`DELETE FROM leitura WHERE fonte_dados_id IS NOT NULL`);
    const regras = (await autenticado(http().get('/api/regras-alerta')).expect(200)).body;
    regraId = regras.find((r: { tipo: string }) => r.tipo === 'risco_enchente').id;
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US10-1 dispara com o nível acima da cota e chuva ou vazão prevista acima do limite no mesmo bairro, na janela', () => {
    it('US10-1 a regra de risco de enchente vem na carga inicial: cota 3,5 m, chuva 50 mm, vazão prevista 15 m³/s, janela de 24 h', async () => {
      const regra = (await autenticado(http().get(`/api/regras-alerta/${regraId}`)).expect(200)).body;
      expect(regra).toMatchObject({
        nome: 'Risco de enchente',
        tipo: 'risco_enchente',
        tipoGrandeza: 'nivel_agua',
        operador: '>',
        valorLimite: 3.5,
        criticidade: 'grave',
        limitePrecipitacao: 50,
        limiteVazaoPrevista: 15,
        janelaHoras: 24,
        sistema: false,
      });
    });

    it('US10-1 nível acima da cota com chuva forte no mesmo bairro dentro da janela abre o alerta', async () => {
      const nivel = await sensor('Uvaranas');
      const chuva = await estacao('Uvaranas');
      await publicar(chuva.codigo, 'precipitacao', 62, horasAtras(2));
      const resultado = await publicar(nivel.codigo, 'nivel_agua', 3.8);
      const [alerta] = await alertasDoRisco(nivel.id);
      expect(resultado.novos).toContain(alerta.id);
      expect(alerta.situacao).toBe('aberto');
    });

    it('US10-1 só o nível acima da cota não basta', async () => {
      const nivel = await sensor('Uvaranas');
      await publicar(nivel.codigo, 'nivel_agua', 3.9);
      // a chuva do caso anterior, em Uvaranas, também estaria na janela: este sensor fica noutro bairro
      const isolado = await sensor('Boa Vista');
      await publicar(isolado.codigo, 'nivel_agua', 3.9);
      expect(await alertasDoRisco(isolado.id)).toEqual([]);
    });

    it('US10-1 chuva em outro bairro ou fora da janela não conta', async () => {
      const nivel = await sensor('Jardim Carvalho');
      const longe = await estacao('Contorno');
      const perto = await estacao('Jardim Carvalho');
      await publicar(longe.codigo, 'precipitacao', 80);
      await publicar(perto.codigo, 'precipitacao', 80, horasAtras(30));
      await publicar(nivel.codigo, 'nivel_agua', 3.8);
      expect(await alertasDoRisco(nivel.id)).toEqual([]);
    });

    it('US10-1 nível abaixo da cota não dispara, mesmo com chuva', async () => {
      const nivel = await sensor('Estrela');
      const chuva = await estacao('Estrela');
      await publicar(chuva.codigo, 'precipitacao', 90);
      await publicar(nivel.codigo, 'nivel_agua', 3.1);
      expect(await alertasDoRisco(nivel.id)).toEqual([]);
    });

    it('US10-1 a vazão prevista do Open-Meteo acima do limite também compõe o alerta', async () => {
      const nivel = await sensor('Neves');
      const [{ id: fonteId }] = await fonte.query(`SELECT id FROM fonte_dados WHERE nome = 'Open-Meteo Flood API'`);
      await fonte.query(
        `INSERT INTO previsao (dispositivo_id, fonte_dados_id, tipo_grandeza, data, valor)
         VALUES ($1, $2, 'vazao', ((now() AT TIME ZONE 'America/Sao_Paulo')::date + 1), 21.5)`,
        [nivel.id, fonteId],
      );
      await publicar(nivel.codigo, 'nivel_agua', 3.7);
      const [alerta] = await alertasDoRisco(nivel.id);
      expect(alerta.composicao.complemento).toMatchObject({ grandeza: 'vazao_prevista', valor: 21.5, limite: 15, dispositivo: nivel.codigo });
    });

    it('US10-1 enquanto o alerta está ativo, novas leituras não abrem outro', async () => {
      const nivel = await sensor('Uvaranas');
      await publicar(nivel.codigo, 'nivel_agua', 3.8);
      await publicar(nivel.codigo, 'nivel_agua', 3.9);
      expect(await alertasDoRisco(nivel.id)).toHaveLength(1);
    });
  });

  it('US10-2 o alerta informa a leitura de nível e a de chuva que o compõem', async () => {
    const nivel = await sensor('Ronda');
    const chuva = await estacao('Ronda');
    await publicar(chuva.codigo, 'precipitacao', 55.5, horasAtras(1));
    await publicar(nivel.codigo, 'nivel_agua', 3.82);
    const [alerta] = await alertasDoRisco(nivel.id);
    const lista = (await autenticado(http().get('/api/alertas')).expect(200)).body;
    expect(lista.find((a: { id: string }) => a.id === alerta.id)).toMatchObject({
      regra: 'Risco de enchente',
      criticidade: 'grave',
      valorObservado: 3.82,
      composicao: {
        nivel: { dispositivo: nivel.codigo, valor: 3.82, limite: 3.5 },
        complemento: { grandeza: 'precipitacao', valor: 55.5, limite: 50, dispositivo: chuva.codigo },
      },
    });
  });

  describe('US10-3 os limites são configuráveis pela tela de regras', () => {
    it('US10-3 mudar o limite de chuva muda o disparo e fica no histórico da regra', async () => {
      await autenticado(http().patch(`/api/regras-alerta/${regraId}`)).send({ limitePrecipitacao: 70, janelaHoras: 6 }).expect(200);
      try {
        const nivel = await sensor('Oficinas');
        const chuva = await estacao('Oficinas');
        await publicar(chuva.codigo, 'precipitacao', 60);
        await publicar(nivel.codigo, 'nivel_agua', 3.8);
        expect(await alertasDoRisco(nivel.id)).toEqual([]);
        await publicar(chuva.codigo, 'precipitacao', 75);
        await publicar(nivel.codigo, 'nivel_agua', 3.8);
        expect(await alertasDoRisco(nivel.id)).toHaveLength(1);
        const historico = (await autenticado(http().get(`/api/regras-alerta/${regraId}/alteracoes`)).expect(200)).body;
        expect(historico[0]).toMatchObject({ antes: { limitePrecipitacao: 50, janelaHoras: 24 }, depois: { limitePrecipitacao: 70, janelaHoras: 6 } });
      } finally {
        await autenticado(http().patch(`/api/regras-alerta/${regraId}`)).send({ limitePrecipitacao: 50, janelaHoras: 24 }).expect(200);
      }
    });

    it('US10-3 limites inválidos, troca de grandeza e campos de enchente numa regra simples são recusados', async () => {
      await autenticado(http().patch(`/api/regras-alerta/${regraId}`)).send({ limitePrecipitacao: 0 }).expect(400);
      await autenticado(http().patch(`/api/regras-alerta/${regraId}`)).send({ janelaHoras: 1.5 }).expect(400);
      const troca = await autenticado(http().patch(`/api/regras-alerta/${regraId}`)).send({ tipoGrandeza: 'vazao' }).expect(400);
      expect(troca.body.message).toContain('A regra de risco de enchente observa sempre o nível de água.');
      const simples = (
        await autenticado(http().post('/api/regras-alerta'))
          .send({ nome: `Simples ${randomUUID()}`, tipoGrandeza: 'vazao', operador: '>', valorLimite: 999, duracaoMinutos: 0, criticidade: 'informativo', ativa: false })
          .expect(201)
      ).body;
      expect(simples).toMatchObject({ tipo: 'simples', limitePrecipitacao: null });
      await autenticado(http().patch(`/api/regras-alerta/${simples.id}`)).send({ limitePrecipitacao: 10 }).expect(400);
    });
  });
});

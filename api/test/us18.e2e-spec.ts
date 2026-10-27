import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { ColetaQualidadeArService } from '../src/qualidade-ar/coleta-qualidade-ar.service';
import { criarApp, criarUsuario, entrar } from './apoio';

interface Alerta {
  id: string;
  regraId: string;
  dispositivoId: string | null;
  dispositivo: string;
  bairro: string | null;
  fonte: string | null;
  situacao: string;
  valorObservado: number;
  orgaoSugeridoId: string | null;
}

// horas inteiras em utc no formato da Air Quality API com timezone=GMT
const hora = (horasAtras: number) => {
  const d = new Date(Date.now() - horasAtras * 3_600_000);
  d.setUTCMinutes(0, 0, 0);
  return d.toISOString().slice(0, 16);
};

describe('US18 alerta quando a poluição ultrapassar o limite configurado', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let coleta: ColetaQualidadeArService;
  let busca: jest.SpyInstance;
  let bairros: { id: string; nome: string }[];
  let centro: number;
  let meioAmbiente: string;

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  const alertas = async (regraId: string): Promise<Alerta[]> =>
    (await autenticado(http().get('/api/alertas')).expect(200)).body.filter((a: Alerta) => a.regraId === regraId);

  // pm2.5 do centro nas horas pedidas (das mais antigas para a atual), os outros bairros em 5 µg/m³
  function responder(pm25Centro: number[], extra: { futuro?: number } = {}) {
    const horas = [...pm25Centro.map((_, i) => hora(pm25Centro.length - 1 - i)), ...(extra.futuro !== undefined ? [hora(-2)] : [])];
    const valoresCentro = [...pm25Centro, ...(extra.futuro !== undefined ? [extra.futuro] : [])];
    const corpo = bairros.map((_, i) => ({
      hourly: {
        time: horas,
        pm2_5: i === centro ? valoresCentro : horas.map(() => 5),
        pm10: horas.map(() => 10),
      },
    }));
    busca.mockImplementation(async () => new Response(JSON.stringify(corpo), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }

  async function regra(limite: number, duracaoMinutos = 0, criticidade = 'atencao') {
    return (
      await autenticado(http().post('/api/regras-alerta'))
        .send({ nome: `PM2.5 ${randomUUID()}`, tipoGrandeza: 'pm25', operador: '>', valorLimite: limite, duracaoMinutos, criticidade, ativa: true })
        .expect(201)
    ).body.id as string;
  }

  const desativar = (id: string) => autenticado(http().patch(`/api/regras-alerta/${id}`)).send({ ativa: false }).expect(200);

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    token = await entrar(app, await criarUsuario(fonte));
    coleta = app.get(ColetaQualidadeArService);
    bairros = await fonte.query(`SELECT id::text AS id, nome FROM bairro ORDER BY id`);
    centro = bairros.findIndex((b) => b.nome === 'Centro');
    const orgaos = (await autenticado(http().get('/api/orgaos')).expect(200)).body;
    meioAmbiente = orgaos.find((o: { sigla: string }) => o.sigla === 'SMMA').id;
  });

  beforeEach(() => {
    busca = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    busca.mockRestore();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US18-1 as regras de PM2.5 e PM10 valem para as leituras do Open-Meteo de cada bairro', () => {
    it('US18-1 uma requisição traz PM2.5 e PM10 de todos os bairros, gravados por bairro sem duplicar e sem as horas futuras', async () => {
      responder([7001, 7002], { futuro: 9999 });
      expect(await coleta.coletar()).toMatchObject({ sucesso: true, leituras: bairros.length * 2 * 2 });
      expect(busca).toHaveBeenCalledTimes(1);
      const url = new URL(String(busca.mock.calls[0][0]));
      expect(url.searchParams.get('latitude')!.split(',')).toHaveLength(bairros.length);
      expect(url.searchParams.get('hourly')).toBe('pm2_5,pm10');
      await coleta.coletar();
      const gravadas = await fonte.query(
        `SELECT l.tipo_grandeza, l.valor::float8 AS valor, l.origem, l.dispositivo_id, f.nome AS fonte
           FROM leitura l JOIN fonte_dados f ON f.id = l.fonte_dados_id
          WHERE l.bairro_id = $1 AND l.data_hora >= $2::timestamptz ORDER BY l.tipo_grandeza, l.data_hora`,
        [bairros[centro].id, `${hora(1)}Z`],
      );
      expect(gravadas).toEqual([
        { tipo_grandeza: 'pm10', valor: 10, origem: 'open-meteo', dispositivo_id: null, fonte: 'Open-Meteo Air Quality API' },
        { tipo_grandeza: 'pm10', valor: 10, origem: 'open-meteo', dispositivo_id: null, fonte: 'Open-Meteo Air Quality API' },
        { tipo_grandeza: 'pm25', valor: 7001, origem: 'open-meteo', dispositivo_id: null, fonte: 'Open-Meteo Air Quality API' },
        { tipo_grandeza: 'pm25', valor: 7002, origem: 'open-meteo', dispositivo_id: null, fonte: 'Open-Meteo Air Quality API' },
      ]);
    });

    it('US18-1 a regra dispara para o bairro acima do limite e o alerta não grave se encerra quando a leitura volta', async () => {
      const id = await regra(6000);
      try {
        responder([5000, 7000]);
        const { alertas: novos } = await coleta.coletar();
        const [alerta] = await alertas(id);
        expect(novos).toContain(alerta.id);
        expect(alerta).toMatchObject({ bairro: 'Centro', valorObservado: 7000, situacao: 'aberto' });
        expect((await alertas(id)).length).toBe(1);
        await coleta.coletar();
        expect((await alertas(id)).length).toBe(1);
        responder([7000, 5000]);
        await coleta.coletar();
        expect(await alertas(id)).toEqual([]);
      } finally {
        await desativar(id);
      }
    });

    it('US18-1 a duração mínima conta as horas seguidas acima do limite no bairro', async () => {
      const id = await regra(6000, 120);
      try {
        responder([5000, 7000, 7000]);
        await coleta.coletar();
        expect(await alertas(id)).toEqual([]);
        responder([7000, 7000, 7000]);
        await coleta.coletar();
        expect(await alertas(id)).toHaveLength(1);
      } finally {
        await desativar(id);
      }
    });

    it('US18-1 falha do Open-Meteo fica registrada na fonte, sem derrubar a rotina', async () => {
      busca.mockImplementation(async () => new Response('{}', { status: 429 }));
      expect(await coleta.coletar()).toMatchObject({ sucesso: false, erro: 'Open-Meteo respondeu HTTP 429' });
      const [registro] = await fonte.query(`SELECT ultimo_erro FROM fonte_dados WHERE nome = 'Open-Meteo Air Quality API'`);
      expect(registro.ultimo_erro).toBe('Open-Meteo respondeu HTTP 429');
      responder([5]);
      expect(await coleta.coletar()).toMatchObject({ sucesso: true });
    });
  });

  describe('US18-2 o alerta indica o bairro e a fonte do dado', () => {
    it('US18-2 o alerta do bairro não tem dispositivo e traz o bairro, a fonte e a posição dentro do bairro', async () => {
      const id = await regra(6000, 0, 'grave');
      try {
        responder([7100]);
        await coleta.coletar();
        const [alerta] = await alertas(id);
        expect(alerta).toMatchObject({ dispositivoId: null, dispositivo: 'Open-Meteo', bairro: 'Centro', fonte: 'Open-Meteo Air Quality API' });
        const [dentro] = await fonte.query(
          `SELECT ST_Contains(area, ST_SetSRID(ST_MakePoint($2, $3), 4326)) AS dentro FROM bairro WHERE id = $1`,
          [bairros[centro].id, (alerta as unknown as { longitude: number }).longitude, (alerta as unknown as { latitude: number }).latitude],
        );
        expect(dentro.dentro).toBe(true);
        const reconhecido = await autenticado(http().post(`/api/alertas/${alerta.id}/reconhecimento`)).send({ providencia: 'Fiscalização acionada.' }).expect(200);
        expect(reconhecido.body).toMatchObject({ situacao: 'em_atendimento', fonte: 'Open-Meteo Air Quality API' });
      } finally {
        await desativar(id);
      }
    });
  });

  describe('US18-3 o órgão Meio Ambiente é o responsável sugerido ao abrir ocorrência a partir do alerta', () => {
    it('US18-3 o alerta de poluição sugere o Meio Ambiente e a ocorrência aberta dele fica vinculada', async () => {
      const id = await regra(6000);
      try {
        responder([7200]);
        await coleta.coletar();
        const [alerta] = await alertas(id);
        expect(alerta.orgaoSugeridoId).toBe(meioAmbiente);
        const [ponto] = await fonte.query(`SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE id = $1`, [
          bairros[centro].id,
        ]);
        const ocorrencia = (
          await autenticado(http().post('/api/ocorrencias'))
            .send({ categoria: 'Qualidade do ar', criticidade: 'atencao', orgaoId: alerta.orgaoSugeridoId, ...ponto, alertaId: alerta.id })
            .expect(201)
        ).body;
        expect(ocorrencia).toMatchObject({ orgao: 'Meio Ambiente', origem: 'alerta', bairro: 'Centro' });
        const detalhe = (await autenticado(http().get(`/api/ocorrencias/${ocorrencia.id}`)).expect(200)).body;
        expect(detalhe.alertas[0]).toMatchObject({ id: alerta.id, dispositivo: 'Open-Meteo, Centro' });
      } finally {
        await desativar(id);
      }
    });

    it('US18-3 alerta de outra grandeza não sugere órgão', async () => {
      const [{ id: regraNivel }] = await fonte.query(
        `INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade, ativa)
         VALUES ($1, 'nivel_agua', '>', 1, 0, 'informativo', false) RETURNING id::text`,
        [`Nível ${randomUUID()}`],
      );
      const [{ id: dispositivo }] = await fonte.query(`SELECT id::text FROM dispositivo ORDER BY id LIMIT 1`);
      const [{ id: alertaId }] = await fonte.query(
        `INSERT INTO alerta (regra_alerta_id, dispositivo_id, valor_observado, operador, valor_limite, criticidade, situacao)
         VALUES ($1, $2, 2, '>', 1, 'informativo', 'aberto') RETURNING id::text`,
        [regraNivel, dispositivo],
      );
      const alerta = (await autenticado(http().get('/api/alertas')).expect(200)).body.find((a: Alerta) => a.id === alertaId);
      expect(alerta.orgaoSugeridoId).toBeNull();
      expect(alerta.fonte).toBeNull();
      await fonte.query(`UPDATE alerta SET situacao = 'encerrado', data_encerramento = now() WHERE id = $1`, [alertaId]);
    });
  });
});

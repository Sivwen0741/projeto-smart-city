import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { io } from 'socket.io-client';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { IngestaoService } from '../src/ingestao/ingestao.service';
import { ColetaOpenMeteoService } from '../src/rios/coleta-open-meteo.service';
import { CAMINHO_TEMPO_REAL } from '../src/tempo-real/tempo-real.gateway';
import { criarApp, criarUsuario, entrar } from './apoio';

const dia = (deslocamento: number) => {
  const d = new Date(Date.now() + deslocamento * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d);
};

// resposta no formato da Flood API: 7 dias passados, hoje e 3 de previsão
function respostaFlood(base = 10) {
  const dias = Array.from({ length: 11 }, (_, i) => dia(i - 7));
  return { daily: { time: dias, river_discharge: dias.map((_, i) => base + i) } };
}

describe('US09 nível e vazão dos rios em tempo real', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let url: string;
  let tipos: Record<string, string>;
  let ponto: { latitude: number; longitude: number };
  let coleta: ColetaOpenMeteoService;
  let busca: jest.SpyInstance;

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  const rios = async () => (await autenticado(http().get('/api/rios')).expect(200)).body;

  async function sensorDeNivel(estado = 'ativo') {
    const identificador = `U9-${randomUUID().slice(0, 8)}`;
    const criado = (
      await autenticado(http().post('/api/dispositivos'))
        .send({
          identificador,
          tipoDispositivoId: tipos['Sensor de nível'],
          ...ponto,
          endereco: 'Arroio de Teste, ponte da rua A',
          estado,
          atributos: { tipoGrandeza: 'nivel_agua', unidadeMedida: 'm', intervaloLeituraSegundos: 30 },
        })
        .expect(201)
    ).body;
    return { id: criado.id as string, codigo: identificador };
  }

  const nivel = (id: string, valor: number, minutosAtras: number) =>
    fonte.query(
      `INSERT INTO leitura (dispositivo_id, tipo_grandeza, valor, unidade, origem, data_hora)
       VALUES ($1, 'nivel_agua', $2, 'm', 'mqtt', now() - $3 * interval '1 minute')`,
      [id, valor, minutosAtras],
    );

  const responderCom = (corpo: unknown, status = 200) =>
    busca.mockImplementation(async () => new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } }));

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    await app.listen(0);
    url = `http://127.0.0.1:${app.getHttpServer().address().port}`;
    token = await entrar(app, await criarUsuario(fonte));
    const lista = (await autenticado(http().get('/api/tipos-dispositivo')).expect(200)).body;
    tipos = Object.fromEntries(lista.map((t: { nome: string; id: string }) => [t.nome, t.id]));
    [ponto] = await fonte.query(
      `SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE nome = 'Olarias'`,
    );
    coleta = app.get(ColetaOpenMeteoService);
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

  describe('US09-1 a rotina consulta a Flood API e grava a vazão com origem open-meteo', () => {
    it('US09-1 a rotina é agendada a cada 60 min quando nada é configurado', () => {
      const anterior = process.env.OPEN_METEO_INTERVALO_MINUTOS;
      delete process.env.OPEN_METEO_INTERVALO_MINUTOS;
      const agendar = jest.spyOn(global, 'setInterval');
      const rotina = new ColetaOpenMeteoService(fonte);
      try {
        rotina.onModuleInit();
        expect(agendar).toHaveBeenCalledWith(expect.any(Function), 3_600_000);
      } finally {
        rotina.onModuleDestroy();
        agendar.mockRestore();
        process.env.OPEN_METEO_INTERVALO_MINUTOS = anterior;
      }
    });

    it('US09-1 grava a vazão diária até hoje como leitura e os dias seguintes como previsão, sem duplicar', async () => {
      const sensor = await sensorDeNivel();
      responderCom(respostaFlood());
      expect(await coleta.coletar()).toMatchObject({ sucesso: true });
      const pedido = busca.mock.calls.map(([u]) => new URL(String(u))).find((u) => Number(u.searchParams.get('latitude')) === ponto.latitude);
      expect(pedido?.searchParams.get('daily')).toBe('river_discharge');
      expect(pedido?.origin).toBe('https://flood-api.open-meteo.com');

      responderCom(respostaFlood(20));
      await coleta.coletar();
      const leituras = await fonte.query(
        `SELECT tipo_grandeza, valor::float8 AS valor, unidade, origem FROM leitura WHERE dispositivo_id = $1 ORDER BY data_hora`,
        [sensor.id],
      );
      expect(leituras).toHaveLength(8);
      expect(leituras[7]).toEqual({ tipo_grandeza: 'vazao', valor: 27, unidade: 'm³/s', origem: 'open-meteo' });
      const previsoes = await fonte.query(`SELECT to_char(data, 'YYYY-MM-DD') AS data, valor::float8 AS valor FROM previsao WHERE dispositivo_id = $1 ORDER BY data`, [sensor.id]);
      expect(previsoes).toEqual([
        { data: dia(1), valor: 28 },
        { data: dia(2), valor: 29 },
        { data: dia(3), valor: 30 },
      ]);
    });

    it('US09-1 a vazão externa não muda a última comunicação nem a última leitura do sensor', async () => {
      const sensor = await sensorDeNivel();
      responderCom(respostaFlood());
      await coleta.coletar();
      const lido = (await autenticado(http().get(`/api/dispositivos/${sensor.id}`)).expect(200)).body;
      expect(lido).toMatchObject({ ultimaComunicacao: null, ultimaLeitura: null });
    });
  });

  describe('US09-2 a tela "Rios" mostra nível, vazão, tendência e cota por ponto', () => {
    it('US09-2 cada ponto traz o nível atual, a tendência da última hora, a série de 6 h e a vazão de hoje', async () => {
      const sensor = await sensorDeNivel();
      await nivel(sensor.id, 3.2, 62);
      await nivel(sensor.id, 3.41, 30);
      await nivel(sensor.id, 3.6, 1);
      responderCom(respostaFlood());
      await coleta.coletar();
      const resposta = await rios();
      const p = resposta.pontos.find((x: { dispositivoId: string }) => x.dispositivoId === sensor.id);
      expect(p).toMatchObject({
        identificador: sensor.codigo,
        nome: 'Arroio de Teste',
        complemento: 'ponte da rua A',
        bairro: 'Olarias',
        nivel: { valor: 3.6 },
        tendencia: 0.4,
        vazao: { data: dia(0), valor: 17 },
      });
      expect(p.serieNivel.length).toBeGreaterThanOrEqual(2);
      expect(p.serieVazao).toHaveLength(8);
      expect(p.previsao.map((v: { data: string }) => v.data)).toEqual([dia(1), dia(2), dia(3)]);
    });

    it('US09-2 a cota vem da menor regra ativa de nível acima de um limite', async () => {
      const nome = `Cota ${randomUUID()}`;
      const { id } = (
        await autenticado(http().post('/api/regras-alerta'))
          .send({ nome, tipoGrandeza: 'nivel_agua', operador: '>', valorLimite: -999, duracaoMinutos: 0, criticidade: 'informativo', ativa: true })
          .expect(201)
      ).body;
      expect((await rios()).cota).toEqual({ valor: -999, operador: '>', regra: nome });
      await autenticado(http().patch(`/api/regras-alerta/${id}`)).send({ ativa: false }).expect(200);
      expect((await rios()).cota?.regra).not.toBe(nome);
    });

    it('US09-2 sensor inativo continua como ponto, sem nível, e com a vazão do Open-Meteo', async () => {
      const sensor = await sensorDeNivel('inativo');
      responderCom(respostaFlood());
      await coleta.coletar();
      const p = (await rios()).pontos.find((x: { dispositivoId: string }) => x.dispositivoId === sensor.id);
      expect(p).toMatchObject({ situacao: 'inativo', nivel: null, tendencia: null, vazao: { valor: 17 } });
    });
  });

  it('US09-3 leitura de nível nova e coleta concluída chegam às telas em tempo real', async () => {
    const sensor = await sensorDeNivel();
    const socket = io(url, { path: CAMINHO_TEMPO_REAL, auth: { token }, transports: ['websocket'], reconnection: false });
    await new Promise<void>((resolver, rejeitar) => {
      socket.once('connect', () => resolver());
      socket.once('connect_error', rejeitar);
    });
    const leitura = new Promise<{ dispositivoId: string; grandezas: string[] }>((resolver) =>
      socket.on('leitura:nova', (l: { dispositivoId: string; grandezas: string[] }) => l.dispositivoId === sensor.id && resolver(l)),
    );
    const coletou = new Promise<void>((resolver) => socket.once('coleta:open-meteo', () => resolver()));
    const ingestao = app.get(IngestaoService) as unknown as { receber(topico: string, conteudo: Buffer): Promise<void> };
    await ingestao.receber(`scoc/dispositivos/${sensor.codigo}/leituras`, Buffer.from(JSON.stringify({ leituras: [{ grandeza: 'nivel_agua', valor: 2.1 }] })));
    expect(await leitura).toEqual({ dispositivoId: sensor.id, grandezas: ['nivel_agua'] });
    responderCom(respostaFlood());
    await coleta.coletar();
    await coletou;
    socket.disconnect();
  });

  describe('US09-4 falha da fonte externa não derruba a rotina e a tela mostra a última coleta', () => {
    it('US09-4 erro de rede ou HTTP é registrado, a rotina não lança e a última coleta boa continua', async () => {
      responderCom(respostaFlood());
      await coleta.coletar();
      const boa = (await rios()).coleta.ultimaColeta;

      busca.mockRejectedValue(new Error('getaddrinfo ENOTFOUND flood-api.open-meteo.com'));
      await expect(coleta.coletar()).resolves.toMatchObject({ sucesso: false });
      let situacao = (await rios()).coleta;
      expect(situacao).toMatchObject({ ultimaColeta: boa, erro: 'getaddrinfo ENOTFOUND flood-api.open-meteo.com' });
      expect(new Date(situacao.ultimaTentativa).getTime()).toBeGreaterThan(new Date(boa).getTime());

      responderCom({ reason: 'limite' }, 429);
      expect(await coleta.coletar()).toMatchObject({ sucesso: false, erro: 'Open-Meteo respondeu HTTP 429' });

      responderCom(respostaFlood());
      expect(await coleta.coletar()).toMatchObject({ sucesso: true });
      situacao = (await rios()).coleta;
      expect(situacao.erro).toBeNull();
    });
  });
});

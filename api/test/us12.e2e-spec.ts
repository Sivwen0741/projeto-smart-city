import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { io } from 'socket.io-client';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { IngestaoService } from '../src/ingestao/ingestao.service';
import { aqiDePm25 } from '../src/painel/aqi';
import { CAMINHO_TEMPO_REAL } from '../src/tempo-real/tempo-real.gateway';
import { criarApp, criarUsuario, entrar } from './apoio';

interface Indicador {
  chave: string;
  valor: number | null;
  unidade: string;
  variacao: string | null;
  proporcao: number | null;
  nota: string;
  estado: string;
}

describe('US12 painel com os indicadores-chave da cidade', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let url: string;
  let tipos: Record<string, string>;
  let ponto: { latitude: number; longitude: number };

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  const painel = async () => (await autenticado(http().get('/api/painel')).expect(200)).body;
  const indicador = async (chave: string): Promise<Indicador> => (await painel()).indicadores.find((i: Indicador) => i.chave === chave);

  async function dispositivo(tipo: string, atributos: Record<string, unknown>, endereco?: string) {
    const identificador = `U12-${randomUUID().slice(0, 8)}`;
    const criado = (
      await autenticado(http().post('/api/dispositivos'))
        .send({ identificador, tipoDispositivoId: tipos[tipo], ...ponto, endereco, estado: 'ativo', atributos })
        .expect(201)
    ).body;
    return { id: criado.id as string, codigo: identificador };
  }

  const leitura = (dispositivoId: string, grandeza: string, valor: number, minutosAtras = 0) =>
    fonte.query(
      `INSERT INTO leitura (dispositivo_id, tipo_grandeza, valor, origem, data_hora) VALUES ($1, $2, $3, 'mqtt', now() - $4 * interval '1 minute')`,
      [dispositivoId, grandeza, valor, minutosAtras],
    );

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    await app.listen(0);
    url = `http://127.0.0.1:${app.getHttpServer().address().port}`;
    token = await entrar(app, await criarUsuario(fonte));
    const lista = (await autenticado(http().get('/api/tipos-dispositivo')).expect(200)).body;
    tipos = Object.fromEntries(lista.map((t: { nome: string; id: string }) => [t.nome, t.id]));
    [ponto] = await fonte.query(
      `SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE nome = 'Piriquitos 10'`,
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US12-1 os seis indicadores da faixa são calculados a partir das leituras', () => {
    it('US12-1 a faixa traz os seis indicadores do protótipo, na ordem', async () => {
      expect((await painel()).indicadores.map((i: Indicador) => i.chave)).toEqual(['rios', 'fluxo', 'ar', 'iluminacao', 'ruido', 'vagas']);
    });

    it('US12-1 nível dos rios é o maior nível medido na última hora', async () => {
      // a própria cota, menor que qualquer outra regra positiva, para não depender do banco (critério do dt07)
      const { id: regraId } = (
        await autenticado(http().post('/api/regras-alerta'))
          .send({ nome: `Cota ${randomUUID()}`, tipoGrandeza: 'nivel_agua', operador: '>', valorLimite: 0.0001, duracaoMinutos: 0, criticidade: 'informativo', ativa: true })
          .expect(201)
      ).body;
      try {
        const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'nivel_agua', unidadeMedida: 'm' }, 'Arroio do Teste, ponte A');
        await leitura(sensor.id, 'nivel_agua', 98.1, 61);
        await leitura(sensor.id, 'nivel_agua', 98.75);
        expect(await indicador('rios')).toEqual(
          expect.objectContaining({ valor: 98.75, unidade: 'm', variacao: '+0,65 m/h', nota: 'Arroio do Teste acima da cota', proporcao: 1 }),
        );
      } finally {
        await autenticado(http().patch(`/api/regras-alerta/${regraId}`)).send({ ativa: false }).expect(200);
      }
    });

    it('US12-1 qualidade do ar é o pior índice calculado do PM2.5 das estações', async () => {
      expect([aqiDePm25(9), aqiDePm25(35.4), aqiDePm25(55.4), aqiDePm25(12)]).toEqual([50, 100, 150, 56]);
      const estacao = await dispositivo('Estação ambiental', { variaveisMonitoradas: ['pm25'] });
      await leitura(estacao.id, 'pm25', 300);
      expect(await indicador('ar')).toMatchObject({ valor: aqiDePm25(300), unidade: 'AQI', nota: 'insalubre em 1 bairro' });
    });

    it('US12-1 iluminação pública é a parcela de pontos de luz respondendo', async () => {
      const controlador = await dispositivo('Controlador de iluminação', { quantidadePontos: 1_000_000 });
      await leitura(controlador.id, 'pontos_apagados', 250_000);
      const i = await indicador('iluminacao');
      expect(i.unidade).toBe('%');
      expect(i.valor).toBeGreaterThan(70);
      expect(i.valor).toBeLessThan(76);
      expect(i.nota).toMatch(/^\d+ pontos sem resposta$/);
    });

    it('US12-1 fluxo de veículos é a velocidade média dos sensores de tráfego e ruído é o maior nível sonoro', async () => {
      const trafego = await dispositivo('Sensor de tráfego', { tipoGrandeza: 'velocidade_media', unidadeMedida: 'km/h' });
      await leitura(trafego.id, 'velocidade_media', 100_000);
      const fluxo = await indicador('fluxo');
      expect(fluxo).toMatchObject({ unidade: 'km/h', proporcao: 1 });
      expect(fluxo.valor).toBeGreaterThan(1000);
      expect(fluxo.nota).toMatch(/^\d+ vias? monitoradas?$/);

      const ruido = await dispositivo('Sensor de ruído', { tipoGrandeza: 'nivel_sonoro', unidadeMedida: 'dB' });
      await leitura(ruido.id, 'nivel_sonoro', 990);
      expect(await indicador('ruido')).toMatchObject({ valor: 990, unidade: 'dB', nota: 'acima do limite de 70 dB' });
    });
  });

  it('US12-2 cada indicador traz valor, unidade, variação e nota, e fica grave com alerta grave ativo da grandeza', async () => {
    const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'nivel_agua', unidadeMedida: 'm' });
    await leitura(sensor.id, 'nivel_agua', 3);
    const [{ id: regraId }] = await fonte.query(
      `INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade, ativa)
       VALUES ($1, 'nivel_agua', '>', 999, 0, 'grave', false) RETURNING id::text`,
      [`Regra ${randomUUID()}`],
    );
    await fonte.query(
      `INSERT INTO alerta (regra_alerta_id, dispositivo_id, valor_observado, operador, valor_limite, criticidade, situacao)
       VALUES ($1, $2, 3, '>', 999, 'grave', 'aberto')`,
      [regraId, sensor.id],
    );
    const rios = await indicador('rios');
    expect(rios.estado).toBe('grave');
    for (const i of (await painel()).indicadores as Indicador[]) {
      expect(i).toEqual(expect.objectContaining({ unidade: expect.any(String), nota: expect.any(String), estado: expect.stringMatching(/^(grave|atencao|estavel|sem_dados)$/) }));
    }
  });

  it('US12-3 indicador sem leitura na última hora aparece sem dados, sem valor inventado', async () => {
    // nenhuma suíte grava vagas livres na última hora; a leitura de duas horas atrás não conta
    await fonte.query(`DELETE FROM leitura WHERE tipo_grandeza = 'vagas_livres' AND data_hora > now() - interval '1 hour'`);
    const vagas = await dispositivo('Sensor de tráfego', { tipoGrandeza: 'vagas_livres', unidadeMedida: 'vagas' });
    await leitura(vagas.id, 'vagas_livres', 212, 120);
    expect(await indicador('vagas')).toMatchObject({ valor: null, variacao: null, proporcao: null, nota: 'sem leitura na última hora', estado: 'sem_dados' });
    await leitura(vagas.id, 'vagas_livres', 212);
    expect(await indicador('vagas')).toMatchObject({ valor: 212, estado: 'estavel' });
  });

  describe('US12-4 os gráficos de ocorrências usam as ocorrências registradas', () => {
    it('US12-4 "abertas hoje" acumula as de hoje por hora contra a média das quatro semanas anteriores', async () => {
      const antes = (await painel()).ocorrenciasHoje;
      const criar = async (diasAtras: number) => {
        const corpo = { categoria: 'Alagamento', criticidade: 'atencao', ...ponto };
        const { id } = (await autenticado(http().post('/api/ocorrencias')).send(corpo).expect(201)).body;
        if (diasAtras) await fonte.query(`UPDATE ocorrencia SET data_abertura = data_abertura - $2 * interval '1 day' WHERE id = $1`, [id, diasAtras]);
      };
      await criar(0);
      await criar(7);
      await criar(14);
      const depois = (await painel()).ocorrenciasHoje;
      expect(depois).toHaveLength(24);
      const agora = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date()));
      expect(depois[agora].hoje).toBe(antes[agora].hoje + 1);
      expect(depois[agora].media).toBeCloseTo(antes[agora].media + 0.5);
      if (agora < 23) expect(depois[agora + 1].hoje).toBeNull();
    });

    it('US12-4 "por bairro" conta as ocorrências das últimas 24 horas', async () => {
      const corpo = { categoria: 'Ruído', criticidade: 'informativo', ...ponto };
      for (let i = 0; i < 40; i++) await autenticado(http().post('/api/ocorrencias')).send(corpo).expect(201);
      const [primeiro] = (await painel()).ocorrenciasPorBairro;
      expect(primeiro.bairro).toBe('Piriquitos 10');
      expect(primeiro.total).toBeGreaterThanOrEqual(40);
    });
  });

  it('US12-5 a leitura nova avisa as telas e muda o indicador na consulta seguinte', async () => {
    const ruido = await dispositivo('Sensor de ruído', { tipoGrandeza: 'nivel_sonoro', unidadeMedida: 'dB' });
    const socket = io(url, { path: CAMINHO_TEMPO_REAL, auth: { token }, transports: ['websocket'], reconnection: false });
    await new Promise<void>((resolver, rejeitar) => {
      socket.once('connect', () => resolver());
      socket.once('connect_error', rejeitar);
    });
    const aviso = new Promise((resolver) => socket.on('leitura:nova', (l: { dispositivoId: string }) => l.dispositivoId === ruido.id && resolver(l)));
    const ingestao = app.get(IngestaoService) as unknown as { receber(topico: string, conteudo: Buffer): Promise<void> };
    await ingestao.receber(`scoc/dispositivos/${ruido.codigo}/leituras`, Buffer.from(JSON.stringify({ leituras: [{ grandeza: 'nivel_sonoro', valor: 5000 }] })));
    await aviso;
    socket.disconnect();
    expect((await indicador('ruido')).valor).toBe(5000);
  });
});

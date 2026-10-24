import { INestApplication, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { connectAsync, MqttClient } from 'mqtt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { IngestaoService } from '../src/ingestao/ingestao.service';
import { criarApp, criarUsuario, entrar } from './apoio';

describe('TT02 camada de ingestão e motor de alertas', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let publicador: MqttClient;
  let tipos: Record<string, string>;
  let ponto: { latitude: number; longitude: number };

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  const minutos = (base: Date, n: number) => new Date(base.getTime() + n * 60_000).toISOString();

  async function esperar<T>(ler: () => Promise<T>, pronto: (valor: T) => boolean, limite = 8000): Promise<T> {
    const fim = Date.now() + limite;
    for (;;) {
      const valor = await ler();
      if (pronto(valor) || Date.now() > fim) return valor;
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  async function publicar(codigo: string, corpo: object | string) {
    await publicador.publishAsync(`scoc/dispositivos/${codigo}/leituras`, typeof corpo === 'string' ? corpo : JSON.stringify(corpo), { qos: 1 });
  }

  async function dispositivo(tipo: string, atributos: Record<string, unknown>, estado = 'ativo') {
    const identificador = `T2-${randomUUID().slice(0, 8)}`;
    const criado = (
      await autenticado(http().post('/api/dispositivos'))
        .send({ identificador, tipoDispositivoId: tipos[tipo], ...ponto, estado, atributos })
        .expect(201)
    ).body;
    return { id: criado.id as string, codigo: identificador };
  }

  async function regra(dados: Record<string, unknown>) {
    const corpo = { nome: `Regra ${randomUUID()}`, tipoGrandeza: 'vazao', operador: '>', valorLimite: 100, duracaoMinutos: 0, criticidade: 'grave', ...dados };
    return (await autenticado(http().post('/api/regras-alerta')).send(corpo).expect(201)).body.id as string;
  }

  const leituras = (id: string) =>
    fonte.query(
      `SELECT tipo_grandeza, valor::float8 AS valor, unidade, origem, data_hora FROM leitura WHERE dispositivo_id = $1 ORDER BY data_hora, tipo_grandeza`,
      [id],
    );

  const alertas = (regraId: string, dispositivoId: string) =>
    fonte.query(
      `SELECT id::text AS id, leitura_id::text AS leitura_id, valor_observado::float8 AS valor_observado, operador,
              valor_limite::float8 AS valor_limite, criticidade, situacao
         FROM alerta WHERE regra_alerta_id = $1 AND dispositivo_id = $2 ORDER BY id`,
      [regraId, dispositivoId],
    );

  const comunicacao = async (id: string) =>
    (await fonte.query(`SELECT ultima_comunicacao FROM dispositivo WHERE id = $1`, [id]))[0].ultima_comunicacao as Date | null;

  // o fluxo é processado em ordem: quando a marca chega, tudo o que foi publicado antes já passou
  async function aguardarProcessamento() {
    const antes = await comunicacao(marca.id);
    await publicar(marca.codigo, {});
    await esperar(() => comunicacao(marca.id), (c) => c !== null && (antes === null || c.getTime() > antes.getTime()));
  }

  let marca: { id: string; codigo: string };

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    token = await entrar(app, await criarUsuario(fonte));
    const lista = (await autenticado(http().get('/api/tipos-dispositivo')).expect(200)).body;
    tipos = Object.fromEntries(lista.map((t: { nome: string; id: string }) => [t.nome, t.id]));
    [ponto] = await fonte.query(
      `SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE nome = 'Olarias'`,
    );
    publicador = await connectAsync(process.env.MQTT_URL!, { clientId: `teste-${randomUUID()}` });
    marca = await dispositivo('Câmera', {});
    // espera a assinatura da interface de programação ficar ativa
    await esperar(
      async () => {
        await publicar(marca.codigo, {});
        await new Promise((r) => setTimeout(r, 200));
        return comunicacao(marca.id);
      },
      (c) => c !== null,
      15000,
    );
  });

  afterAll(async () => {
    await publicador?.endAsync();
    await app?.close();
  });

  afterEach(() => jest.restoreAllMocks());

  describe('TT02-1 a leitura recebida pelo MQTT é gravada', () => {
    it('TT02-1 grava grandeza, valor, unidade, origem mqtt e o horário da medição', async () => {
      const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'vazao' });
      await publicar(sensor.codigo, { dataHora: '2026-10-24T12:00:00.000Z', leituras: [{ grandeza: 'vazao', valor: 12.5 }] });
      const gravadas = await esperar(() => leituras(sensor.id), (l) => l.length > 0);
      expect(gravadas).toEqual([
        { tipo_grandeza: 'vazao', valor: 12.5, unidade: 'm³/s', origem: 'mqtt', data_hora: new Date('2026-10-24T12:00:00.000Z') },
      ]);
    });

    it('TT02-1 a estação ambiental envia várias grandezas na mesma mensagem', async () => {
      const estacao = await dispositivo('Estação ambiental', { variaveisMonitoradas: ['pm25', 'pm10'] });
      await publicar(estacao.codigo, { leituras: [{ grandeza: 'pm25', valor: 31 }, { grandeza: 'pm10', valor: 48, unidade: 'µg/m³' }] });
      const gravadas = await esperar(() => leituras(estacao.id), (l) => l.length === 2);
      expect(gravadas.map((l: { tipo_grandeza: string; valor: number }) => `${l.tipo_grandeza} ${l.valor}`)).toEqual(['pm10 48', 'pm25 31']);
    });
  });

  describe('TT02-2 cada mensagem aceita atualiza a última comunicação', () => {
    it('TT02-2 o dispositivo passa de sem comunicação a operando', async () => {
      const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'vazao' });
      expect((await autenticado(http().get(`/api/dispositivos/${sensor.id}`)).expect(200)).body.situacao).toBe('sem_comunicacao');
      await publicar(sensor.codigo, { leituras: [{ grandeza: 'vazao', valor: 3 }] });
      await esperar(() => comunicacao(sensor.id), (c) => c !== null);
      const lido = (await autenticado(http().get(`/api/dispositivos/${sensor.id}`)).expect(200)).body;
      expect(lido.situacao).toBe('operando');
      expect(Date.now() - new Date(lido.ultimaComunicacao).getTime()).toBeLessThan(10_000);
    });

    it('TT02-2 câmera e semáforo mandam só sinal de vida, sem leitura', async () => {
      const semaforo = await dispositivo('Semáforo inteligente', {});
      await publicar(semaforo.codigo, {});
      expect(await esperar(() => comunicacao(semaforo.id), (c) => c !== null)).not.toBeNull();
      expect(await leituras(semaforo.id)).toEqual([]);
    });
  });

  it('TT02-3 mensagem inválida é descartada sem derrubar o assinante e fica registrada no log', async () => {
    const avisos = jest.spyOn(Logger.prototype, 'warn');
    const inativo = await dispositivo('Sensor de nível', { tipoGrandeza: 'vazao' }, 'inativo');
    const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'vazao' });
    const casos: [string, object | string, string][] = [
      ['NAO-EXISTE-T2', { leituras: [{ grandeza: 'vazao', valor: 1 }] }, 'dispositivo não cadastrado'],
      [inativo.codigo, { leituras: [{ grandeza: 'vazao', valor: 1 }] }, 'dispositivo inativo'],
      [sensor.codigo, { leituras: [{ grandeza: 'pm25', valor: 1 }] }, 'o dispositivo não mede pm25'],
      [sensor.codigo, { leituras: [{ grandeza: 'chuva', valor: 1 }] }, 'grandeza desconhecida: chuva'],
      [sensor.codigo, { leituras: [{ grandeza: 'vazao', valor: 'alto' }] }, 'valor inválido para vazao'],
      [sensor.codigo, { dataHora: 'ontem', leituras: [] }, 'dataHora inválida'],
      [sensor.codigo, 'isto não é json', 'conteúdo não é JSON'],
    ];
    for (const [codigo, corpo] of casos) await publicar(codigo, corpo);
    await aguardarProcessamento();

    expect(await leituras(sensor.id)).toEqual([]);
    expect(await leituras(inativo.id)).toEqual([]);
    expect(await comunicacao(sensor.id)).toBeNull();
    expect(await comunicacao(inativo.id)).toBeNull();
    const mensagens = avisos.mock.calls.map(([m]) => String(m));
    for (const [codigo, , motivo] of casos) expect(mensagens).toContain(`mensagem descartada de ${codigo}: ${motivo}`);

    await publicar(sensor.codigo, { leituras: [{ grandeza: 'vazao', valor: 2 }] });
    expect(await esperar(() => leituras(sensor.id), (l) => l.length === 1)).toHaveLength(1);
  });

  describe('TT02-4 as leituras são avaliadas contra as regras ativas da mesma grandeza', () => {
    const t0 = new Date(Date.now() - 60 * 60_000);

    it('TT02-4 a condição precisa durar o tempo mínimo da regra, e a duração zero dispara na primeira leitura', async () => {
      const imediata = await regra({ valorLimite: 500, duracaoMinutos: 0 });
      const dezMinutos = await regra({ valorLimite: 100, duracaoMinutos: 10 });
      const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'vazao' });

      await publicar(sensor.codigo, { dataHora: minutos(t0, 0), leituras: [{ grandeza: 'vazao', valor: 600 }] });
      await aguardarProcessamento();
      expect(await alertas(imediata, sensor.id)).toHaveLength(1);
      expect(await alertas(dezMinutos, sensor.id)).toHaveLength(0);

      await publicar(sensor.codigo, { dataHora: minutos(t0, 5), leituras: [{ grandeza: 'vazao', valor: 600 }] });
      await aguardarProcessamento();
      expect(await alertas(dezMinutos, sensor.id)).toHaveLength(0);

      await publicar(sensor.codigo, { dataHora: minutos(t0, 10), leituras: [{ grandeza: 'vazao', valor: 600 }] });
      await aguardarProcessamento();
      expect(await alertas(dezMinutos, sensor.id)).toHaveLength(1);
    });

    it('TT02-4 uma leitura dentro do limite reinicia a contagem da duração', async () => {
      const dezMinutos = await regra({ valorLimite: 100, duracaoMinutos: 10 });
      const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'vazao' });
      for (const [n, valor] of [
        [0, 600],
        [5, 50],
        [12, 600],
      ]) {
        await publicar(sensor.codigo, { dataHora: minutos(t0, n), leituras: [{ grandeza: 'vazao', valor }] });
      }
      await aguardarProcessamento();
      expect(await alertas(dezMinutos, sensor.id)).toHaveLength(0);

      await publicar(sensor.codigo, { dataHora: minutos(t0, 22), leituras: [{ grandeza: 'vazao', valor: 600 }] });
      await aguardarProcessamento();
      expect(await alertas(dezMinutos, sensor.id)).toHaveLength(1);
    });

    it('TT02-4 regra desativada e regra de outra grandeza não disparam', async () => {
      const desativada = await regra({ ativa: false });
      const outraGrandeza = await regra({ tipoGrandeza: 'nivel_agua', valorLimite: 0 });
      const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'vazao' });
      await publicar(sensor.codigo, { leituras: [{ grandeza: 'vazao', valor: 900 }] });
      await aguardarProcessamento();
      expect(await alertas(desativada, sensor.id)).toHaveLength(0);
      expect(await alertas(outraGrandeza, sensor.id)).toHaveLength(0);
    });

    it('TT02-4 dispositivo em manutenção grava a leitura e não gera alerta', async () => {
      const imediata = await regra({});
      const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'vazao' }, 'manutencao');
      await publicar(sensor.codigo, { leituras: [{ grandeza: 'vazao', valor: 900 }] });
      await aguardarProcessamento();
      expect(await leituras(sensor.id)).toHaveLength(1);
      expect(await alertas(imediata, sensor.id)).toHaveLength(0);
    });
  });

  it('TT02-5 o alerta guarda regra, dispositivo, leitura, valor observado e a cópia de operador, limite e gravidade', async () => {
    const regraId = await regra({ operador: '>=', valorLimite: 300, criticidade: 'atencao' });
    const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'vazao' });
    await publicar(sensor.codigo, { leituras: [{ grandeza: 'vazao', valor: 312.4 }] });
    await aguardarProcessamento();
    const [{ id: leituraId }] = await fonte.query(`SELECT id::text AS id FROM leitura WHERE dispositivo_id = $1`, [sensor.id]);
    const [alerta] = await alertas(regraId, sensor.id);
    expect(alerta).toMatchObject({ leitura_id: leituraId, valor_observado: 312.4, operador: '>=', valor_limite: 300, criticidade: 'atencao', situacao: 'aberto' });

    await autenticado(http().patch(`/api/regras-alerta/${regraId}`)).send({ operador: '>', valorLimite: 999, criticidade: 'grave' }).expect(200);
    expect((await alertas(regraId, sensor.id))[0]).toMatchObject({ operador: '>=', valor_limite: 300, criticidade: 'atencao' });
  });

  it('TT02-6 enquanto o alerta está ativo, novas leituras fora do limite não abrem outro', async () => {
    const regraId = await regra({});
    const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'vazao' });
    const fora = { leituras: [{ grandeza: 'vazao', valor: 900 }] };
    for (let i = 0; i < 3; i++) await publicar(sensor.codigo, fora);
    await aguardarProcessamento();
    expect(await alertas(regraId, sensor.id)).toHaveLength(1);

    await fonte.query(`UPDATE alerta SET situacao = 'em_atendimento' WHERE regra_alerta_id = $1`, [regraId]);
    await publicar(sensor.codigo, fora);
    await aguardarProcessamento();
    expect(await alertas(regraId, sensor.id)).toHaveLength(1);

    await expect(
      fonte.query(
        `INSERT INTO alerta (regra_alerta_id, dispositivo_id, valor_observado, operador, valor_limite, criticidade, situacao)
         VALUES ($1, $2, 900, '>', 100, 'grave', 'aberto')`,
        [regraId, sensor.id],
      ),
    ).rejects.toThrow(/alerta_ativo_uq/);

    await fonte.query(`UPDATE alerta SET situacao = 'encerrado' WHERE regra_alerta_id = $1`, [regraId]);
    await publicar(sensor.codigo, fora);
    await aguardarProcessamento();
    expect((await alertas(regraId, sensor.id)).map((a: { situacao: string }) => a.situacao)).toEqual(['encerrado', 'aberto']);
  });

  it('TT02-7 depois de uma queda da conexão com o broker, reconecta sozinho e volta a gravar', async () => {
    const ingestao = app.get(IngestaoService) as unknown as { cliente: MqttClient };
    const sensor = await dispositivo('Sensor de nível', { tipoGrandeza: 'vazao' });
    ingestao.cliente.stream.destroy();
    await esperar(async () => ingestao.cliente.connected, (c) => !c, 3000);
    const reconectado = await esperar(async () => ingestao.cliente.connected, (c) => c, 15000);
    expect(reconectado).toBe(true);
    const gravadas = await esperar(
      async () => {
        await publicar(sensor.codigo, { leituras: [{ grandeza: 'vazao', valor: 7 }] });
        await new Promise((r) => setTimeout(r, 300));
        return leituras(sensor.id);
      },
      (l) => l.length > 0,
      15000,
    );
    expect(gravadas.length).toBeGreaterThan(0);
  });
});

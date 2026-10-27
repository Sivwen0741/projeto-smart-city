import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { criarApp, criarUsuario, entrar } from './apoio';

interface Ponto {
  inicio: string;
  media: number;
  minimo: number;
  maximo: number;
  leituras: number;
}

describe('US19 gráfico histórico de uma variável monitorada', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let tipos: Record<string, string>;
  let ponto: { latitude: number; longitude: number };

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  const historico = (id: string, consulta: Record<string, string> = {}) => autenticado(http().get(`/api/dispositivos/${id}/historico`).query(consulta));

  async function estacao() {
    const criado = (
      await autenticado(http().post('/api/dispositivos'))
        .send({
          identificador: `U19-${randomUUID().slice(0, 8)}`,
          tipoDispositivoId: tipos['Estação ambiental'],
          ...ponto,
          estado: 'ativo',
          atributos: { variaveisMonitoradas: ['pm25', 'temperatura'] },
        })
        .expect(201)
    ).body;
    return criado.id as string;
  }

  // leituras em minutos contados a partir do início de uma hora inteira, para caírem em blocos conhecidos
  async function leituras(id: string, grandeza: string, horasAtras: number, valores: [number, number][]) {
    for (const [minuto, valor] of valores) {
      await fonte.query(
        `INSERT INTO leitura (dispositivo_id, tipo_grandeza, valor, origem, data_hora)
         VALUES ($1, $2, $3, 'mqtt', date_trunc('hour', now()) - $4 * interval '1 hour' + $5 * interval '1 minute')`,
        [id, grandeza, valor, horasAtras, minuto],
      );
    }
  }

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    token = await entrar(app, await criarUsuario(fonte));
    const lista = (await autenticado(http().get('/api/tipos-dispositivo')).expect(200)).body;
    tipos = Object.fromEntries(lista.map((t: { nome: string; id: string }) => [t.nome, t.id]));
    [ponto] = await fonte.query(
      `SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE nome = 'Uvaranas'`,
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US19-1 o histórico mostra a grandeza ao longo do tempo, com período de 24 h, 7 dias ou 30 dias', () => {
    it('US19-1 sem parâmetros, 24 h da grandeza da última leitura, em blocos de 5 min', async () => {
      const id = await estacao();
      await leituras(id, 'temperatura', 2, [[1, 20]]);
      await leituras(id, 'pm25', 3, [[1, 10], [2, 20], [7, 30]]);
      const { body } = await historico(id).expect(200);
      expect(body).toMatchObject({ dispositivoId: id, periodo: '24h', blocoMinutos: 5, grandeza: 'temperatura', rotulo: 'Temperatura do ar', unidade: '°C' });
      expect(body.grandezas.map((g: { codigo: string }) => g.codigo)).toEqual(['pm25', 'temperatura']);
      expect(new Date(body.fim).getTime() - new Date(body.inicio).getTime()).toBe(24 * 3_600_000);
      const pm = (await historico(id, { grandeza: 'pm25' }).expect(200)).body;
      expect(pm.pontos.map((p: Ponto) => [p.media, p.minimo, p.maximo, p.leituras])).toEqual([
        [15, 10, 20, 2],
        [30, 30, 30, 1],
      ]);
      expect(new Date(pm.pontos[1].inicio).getTime() - new Date(pm.pontos[0].inicio).getTime()).toBe(5 * 60_000);
    });

    it('US19-1 7 e 30 dias usam blocos de 1 h e só as leituras do período', async () => {
      const id = await estacao();
      await leituras(id, 'pm25', 3, [[1, 10], [2, 20], [7, 30]]);
      await leituras(id, 'pm25', 24 * 10, [[5, 50]]);
      await leituras(id, 'pm25', 24 * 40, [[5, 90]]);
      const semana = (await historico(id, { periodo: '7d', grandeza: 'pm25' }).expect(200)).body;
      expect(semana.blocoMinutos).toBe(60);
      expect(semana.pontos.map((p: Ponto) => [p.media, p.minimo, p.maximo, p.leituras])).toEqual([[20, 10, 30, 3]]);
      const mes = (await historico(id, { periodo: '30d', grandeza: 'pm25' }).expect(200)).body;
      expect(mes.pontos.map((p: Ponto) => p.media)).toEqual([50, 20]);
    });

    it('US19-1 recusa período inválido, grandeza sem leitura e dispositivo inexistente', async () => {
      const id = await estacao();
      await leituras(id, 'pm25', 1, [[1, 10]]);
      expect((await historico(id, { periodo: '1a' }).expect(400)).body.message).toEqual(['Período deve ser 24h, 7d ou 30d.']);
      expect((await historico(id, { grandeza: 'nivel_agua' }).expect(400)).body.message).toEqual(['O dispositivo não tem leituras de Nível de água nos últimos 30 dias.']);
      await historico('999999999').expect(404);
    });

    it('US19-1 dispositivo sem leituras devolve o histórico vazio, sem grandeza', async () => {
      const { body } = await historico(await estacao()).expect(200);
      expect(body).toMatchObject({ grandeza: null, grandezas: [], pontos: [], limites: [] });
    });
  });

  describe('US19-2 o gráfico mostra a linha do limite das regras ativas da grandeza', () => {
    it('US19-2 traz as regras ativas da grandeza, sem as desativadas', async () => {
      const nome = `Umidade ${randomUUID()}`;
      const criar = (sufixo: string, valor: number, ativa: boolean) =>
        autenticado(http().post('/api/regras-alerta'))
          .send({ nome: `${nome} ${sufixo}`, tipoGrandeza: 'umidade', operador: '<', valorLimite: valor, duracaoMinutos: 0, criticidade: 'atencao', ativa })
          .expect(201);
      const ativa = (await criar('ativa', 0.0002, true)).body.id;
      const inativa = (await criar('inativa', 0.0001, false)).body.id;
      try {
        const id = await estacao();
        await leituras(id, 'umidade', 1, [[1, 80]]);
        const { limites } = (await historico(id, { grandeza: 'umidade' }).expect(200)).body;
        const minhas = limites.filter((l: { regra: string }) => l.regra.startsWith(nome));
        expect(minhas).toEqual([{ regra: `${nome} ativa`, operador: '<', valor: 0.0002, criticidade: 'atencao' }]);
      } finally {
        for (const r of [ativa, inativa]) await autenticado(http().patch(`/api/regras-alerta/${r}`)).send({ ativa: false }).expect(200);
      }
    });
  });

  describe('US19-3 a coluna "Últimas 3 h" traz a série do minigráfico', () => {
    it('US19-3 nove médias de 20 min na grandeza da última leitura, nulas onde não houve leitura', async () => {
      const id = await estacao();
      const agora = async (minutosAtras: number, valor: number) =>
        fonte.query(
          `INSERT INTO leitura (dispositivo_id, tipo_grandeza, valor, origem, data_hora) VALUES ($1, 'pm25', $2, 'mqtt', now() - $3 * interval '1 minute')`,
          [id, valor, minutosAtras],
        );
      await agora(170, 40);
      await agora(5, 10);
      await agora(4, 20);
      await agora(200, 99);
      const lista = (await autenticado(http().get('/api/dispositivos')).expect(200)).body;
      const serie = lista.find((d: { id: string }) => d.id === id).ultimas3h;
      expect(serie).toHaveLength(9);
      expect(serie[0]).toBe(40);
      expect(serie[8]).toBe(15);
      expect(serie.slice(1, 8).every((v: number | null) => v === null)).toBe(true);
      expect((await autenticado(http().get(`/api/dispositivos/${await estacao()}`)).expect(200)).body.ultimas3h).toBeNull();
    });
  });

  describe('US19-4 períodos longos são agregados no banco', () => {
    it('US19-4 mil leituras em 30 dias chegam como no máximo um ponto por hora', async () => {
      const id = await estacao();
      await fonte.query(
        `INSERT INTO leitura (dispositivo_id, tipo_grandeza, valor, origem, data_hora)
         SELECT $1, 'pm25', n % 50, 'mqtt', now() - n * interval '43 minutes' FROM generate_series(0, 999) n`,
        [id],
      );
      const { pontos } = (await historico(id, { periodo: '30d', grandeza: 'pm25' }).expect(200)).body;
      expect(pontos.length).toBeLessThanOrEqual(30 * 24 + 1);
      expect(pontos.length).toBeLessThan(1000);
      expect(pontos.reduce((s: number, p: Ponto) => s + p.leituras, 0)).toBe(1000);
      expect(pontos.every((p: Ponto) => p.minimo <= p.media && p.media <= p.maximo)).toBe(true);
    });
  });
});

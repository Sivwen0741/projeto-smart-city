import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { connectAsync, MqttClient } from 'mqtt';
import { io, Socket } from 'socket.io-client';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { EventosAlertasService } from '../src/alertas/eventos-alertas.service';
import { CAMINHO_TEMPO_REAL } from '../src/tempo-real/tempo-real.gateway';
import { criarApp, criarUsuario, entrar } from './apoio';

describe('US03 novos alertas na tela em tempo real', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let url: string;
  let publicador: MqttClient;
  const abertos: Socket[] = [];

  function conectar(auth: Record<string, unknown> = { token }): Socket {
    const socket = io(url, { path: CAMINHO_TEMPO_REAL, auth, transports: ['websocket'], reconnection: false });
    abertos.push(socket);
    return socket;
  }

  const conectado = (socket: Socket) =>
    new Promise<void>((resolver, rejeitar) => {
      socket.once('connect', () => resolver());
      socket.once('connect_error', rejeitar);
    });

  function proximo<T>(socket: Socket, evento: string, filtro: (dado: T) => boolean, limite = 5000): Promise<T> {
    return new Promise((resolver, rejeitar) => {
      const tempo = setTimeout(() => rejeitar(new Error(`${evento} não chegou em ${limite} ms`)), limite);
      const ouvir = (dado: T) => {
        if (!filtro(dado)) return;
        clearTimeout(tempo);
        socket.off(evento, ouvir);
        resolver(dado);
      };
      socket.on(evento, ouvir);
    });
  }

  async function sensorComRegra() {
    const codigo = `U3-${randomUUID().slice(0, 8)}`;
    const [{ id: dispositivoId }] = await fonte.query(
      `INSERT INTO dispositivo (identificador, tipo_dispositivo_id, localizacao, atributos_especificos)
       SELECT $1, id, (SELECT ST_PointOnSurface(area)::geography FROM bairro WHERE nome = 'Olarias'), '{"tipoGrandeza": "vazao"}'
         FROM tipo_dispositivo WHERE nome = 'Sensor de nível' RETURNING id::text`,
      [codigo],
    );
    const [{ id: regraId }] = await fonte.query(
      `INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade)
       VALUES ($1, 'vazao', '>', 100, 0, 'grave') RETURNING id::text`,
      [`Regra ${randomUUID()}`],
    );
    return { codigo, dispositivoId, regraId };
  }

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    await app.listen(0);
    url = `http://127.0.0.1:${app.getHttpServer().address().port}`;
    token = await entrar(app, await criarUsuario(fonte));
    publicador = await connectAsync(process.env.MQTT_URL!, { clientId: `teste-${randomUUID()}` });
  });

  afterAll(async () => {
    for (const s of abertos) s.disconnect();
    await publicador?.endAsync();
    await app?.close();
  });

  it('US03-1 o alerta novo chega à tela em até 2 segundos depois da leitura que o disparou', async () => {
    const { codigo, dispositivoId } = await sensorComRegra();
    const socket = conectar();
    await conectado(socket);
    // espera a assinatura do mqtt da interface de programação, como no teste da TT02
    for (let i = 0; i < 50; i++) {
      await publicador.publishAsync(`scoc/dispositivos/${codigo}/leituras`, '{}', { qos: 1 });
      await new Promise((r) => setTimeout(r, 200));
      const [{ ultima_comunicacao }] = await fonte.query(`SELECT ultima_comunicacao FROM dispositivo WHERE id = $1`, [dispositivoId]);
      if (ultima_comunicacao) break;
    }
    const chegada = proximo<{ dispositivoId: string; criticidade: string; situacao: string }>(socket, 'alerta:novo', (a) => a.dispositivoId === dispositivoId);
    const inicio = Date.now();
    await publicador.publishAsync(`scoc/dispositivos/${codigo}/leituras`, JSON.stringify({ leituras: [{ grandeza: 'vazao', valor: 150 }] }), { qos: 1 });
    const alerta = await chegada;
    expect(Date.now() - inicio).toBeLessThan(2000);
    expect(alerta).toMatchObject({ dispositivo: codigo, criticidade: 'grave', situacao: 'aberto', valorObservado: 150 });
  });

  it('US03-2 a mudança de situação feita por outro operador também chega em tempo real', async () => {
    const { dispositivoId, regraId } = await sensorComRegra();
    const [{ id }] = await fonte.query(
      `INSERT INTO alerta (regra_alerta_id, dispositivo_id, valor_observado, operador, valor_limite, criticidade, situacao)
       VALUES ($1, $2, 150, '>', 100, 'grave', 'aberto') RETURNING id::text`,
      [regraId, dispositivoId],
    );
    const [outro, este] = [conectar(), conectar()];
    await Promise.all([conectado(outro), conectado(este)]);
    const recebido = proximo<{ id: string; situacao: string }>(outro, 'alerta:atualizado', (a) => a.id === id);
    await fonte.query(`UPDATE alerta SET situacao = 'em_atendimento', data_reconhecimento = now() WHERE id = $1`, [id]);
    await app.get(EventosAlertasService).atualizado(id);
    expect(await recebido).toMatchObject({ id, situacao: 'em_atendimento' });
  });

  describe('US03-3 a conexão em tempo real exige o mesmo token', () => {
    it('US03-3 sem token, com token adulterado ou de usuário inativo, a conexão é recusada', async () => {
      const inativo = await criarUsuario(fonte);
      const tokenInativo = await entrar(app, inativo);
      await fonte.query(`UPDATE usuario SET ativo = false WHERE id = $1`, [inativo.id]);
      for (const auth of [{}, { token: `${token}x` }, { token: tokenInativo }]) {
        await expect(conectado(conectar(auth))).rejects.toThrow('Sessão inválida ou expirada. Entre novamente.');
      }
    });

    it('US03-3 com token válido, a conexão é aceita', async () => {
      await expect(conectado(conectar())).resolves.toBeUndefined();
    });
  });

  it('US03-4 o alerta emitido com a tela desconectada está na lista consultada ao reconectar', async () => {
    const { codigo, dispositivoId } = await sensorComRegra();
    const socket = conectar();
    await conectado(socket);
    socket.disconnect();
    await publicador.publishAsync(`scoc/dispositivos/${codigo}/leituras`, JSON.stringify({ leituras: [{ grandeza: 'vazao', valor: 180 }] }), { qos: 1 });
    let lista: { dispositivoId: string }[] = [];
    for (let i = 0; i < 50 && !lista.some((a) => a.dispositivoId === dispositivoId); i++) {
      await new Promise((r) => setTimeout(r, 100));
      lista = (await request(app.getHttpServer()).get('/api/alertas').set('Authorization', `Bearer ${token}`).expect(200)).body;
    }
    socket.connect();
    await conectado(socket);
    expect(lista.some((a) => a.dispositivoId === dispositivoId)).toBe(true);
  });
});

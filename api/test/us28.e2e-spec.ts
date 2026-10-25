import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { connectAsync, MqttClient } from 'mqtt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { EventosAlertasService } from '../src/alertas/eventos-alertas.service';
import { criarApp, criarUsuario, entrar } from './apoio';

describe('US28 alerta grave visível até ser reconhecido', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let publicador: MqttClient;

  const http = () => request(app.getHttpServer());
  const resumo = async (comToken = token) =>
    (await http().get('/api/alertas/resumo').set('Authorization', `Bearer ${comToken}`).expect(200)).body;
  const situacoes = async (regraId: string, dispositivoId: string) =>
    (
      await fonte.query(
        `SELECT situacao, data_encerramento IS NOT NULL AS encerrado FROM alerta WHERE regra_alerta_id = $1 AND dispositivo_id = $2 ORDER BY id`,
        [regraId, dispositivoId],
      )
    ).map((a: { situacao: string }) => a.situacao);

  async function cenario(criticidade: string) {
    const codigo = `U28-${randomUUID().slice(0, 8)}`;
    const [{ id: dispositivoId }] = await fonte.query(
      `INSERT INTO dispositivo (identificador, tipo_dispositivo_id, localizacao, atributos_especificos)
       SELECT $1, id, (SELECT ST_PointOnSurface(area)::geography FROM bairro WHERE nome = 'Olarias'), '{"tipoGrandeza": "vazao"}'
         FROM tipo_dispositivo WHERE nome = 'Sensor de nível' RETURNING id::text`,
      [codigo],
    );
    const [{ id: regraId }] = await fonte.query(
      `INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade)
       VALUES ($1, 'vazao', '>', 100, 0, $2) RETURNING id::text`,
      [`Regra ${randomUUID()}`, criticidade],
    );
    return { codigo, dispositivoId, regraId };
  }

  async function publicarEsperar(codigo: string, dispositivoId: string, valor: number) {
    const [{ total: antes }] = await fonte.query(`SELECT count(*)::int AS total FROM leitura WHERE dispositivo_id = $1`, [dispositivoId]);
    await publicador.publishAsync(`scoc/dispositivos/${codigo}/leituras`, JSON.stringify({ leituras: [{ grandeza: 'vazao', valor }] }), { qos: 1 });
    for (let i = 0; i < 80; i++) {
      const [{ total }] = await fonte.query(`SELECT count(*)::int AS total FROM leitura WHERE dispositivo_id = $1`, [dispositivoId]);
      if (total > antes) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    // a avaliação e o aviso às telas acontecem logo depois da gravação
    await new Promise((r) => setTimeout(r, 300));
  }

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    token = await entrar(app, await criarUsuario(fonte));
    publicador = await connectAsync(process.env.MQTT_URL!, { clientId: `teste-${randomUUID()}` });
    const marca = await cenario('informativo');
    for (let i = 0; i < 50; i++) {
      await publicador.publishAsync(`scoc/dispositivos/${marca.codigo}/leituras`, '{}', { qos: 1 });
      await new Promise((r) => setTimeout(r, 200));
      const [{ ultima_comunicacao }] = await fonte.query(`SELECT ultima_comunicacao FROM dispositivo WHERE id = $1`, [marca.dispositivoId]);
      if (ultima_comunicacao) break;
    }
  });

  afterAll(async () => {
    await publicador?.endAsync();
    await app?.close();
  });

  describe('US28-1 só o grave sem reconhecimento continua ativo quando a leitura normaliza', () => {
    it('US28-1 atenção e informativo sem reconhecimento são encerrados quando a leitura volta ao normal', async () => {
      for (const criticidade of ['atencao', 'informativo']) {
        const { codigo, dispositivoId, regraId } = await cenario(criticidade);
        await publicarEsperar(codigo, dispositivoId, 150);
        expect(await situacoes(regraId, dispositivoId)).toEqual(['aberto']);
        const avisos = jest.spyOn(app.get(EventosAlertasService), 'atualizado');
        await publicarEsperar(codigo, dispositivoId, 80);
        expect(`${criticidade} ${await situacoes(regraId, dispositivoId)}`).toBe(`${criticidade} encerrado`);
        const [{ encerramento }] = await fonte.query(
          `SELECT data_encerramento IS NOT NULL AS encerramento FROM alerta WHERE regra_alerta_id = $1`,
          [regraId],
        );
        expect(encerramento).toBe(true);
        const [{ id: alertaId }] = await fonte.query(`SELECT id::text AS id FROM alerta WHERE regra_alerta_id = $1`, [regraId]);
        expect(avisos.mock.calls.map(([id]) => id)).toContain(alertaId);
        avisos.mockRestore();
      }
    });

    it('US28-1 o alerta grave sem reconhecimento nunca é encerrado automaticamente', async () => {
      const { codigo, dispositivoId, regraId } = await cenario('grave');
      await publicarEsperar(codigo, dispositivoId, 150);
      const avisos = jest.spyOn(app.get(EventosAlertasService), 'atualizado');
      for (const valor of [80, 50, 10]) await publicarEsperar(codigo, dispositivoId, valor);
      expect(await situacoes(regraId, dispositivoId)).toEqual(['aberto']);
      expect(avisos.mock.calls.filter(([id]) => id === undefined)).toEqual([]);
      avisos.mockRestore();
    });

    it('US28-1 o alerta já reconhecido não é encerrado pela normalização', async () => {
      const { codigo, dispositivoId, regraId } = await cenario('atencao');
      await publicarEsperar(codigo, dispositivoId, 150);
      await fonte.query(`UPDATE alerta SET situacao = 'em_atendimento', data_reconhecimento = now() WHERE regra_alerta_id = $1`, [regraId]);
      await publicarEsperar(codigo, dispositivoId, 80);
      expect(await situacoes(regraId, dispositivoId)).toEqual(['em_atendimento']);
    });

    it('US28-1 a normalização usa o limite copiado no disparo, não o da regra editada', async () => {
      const { codigo, dispositivoId, regraId } = await cenario('atencao');
      await publicarEsperar(codigo, dispositivoId, 150);
      await fonte.query(`UPDATE regra_alerta SET valor_limite = 50 WHERE id = $1`, [regraId]);
      await publicarEsperar(codigo, dispositivoId, 80);
      expect(await situacoes(regraId, dispositivoId)).toEqual(['aberto']);
    });
  });

  it('US28-2 o resumo informa a quantidade e o grave sem reconhecimento mais antigo, para a faixa', async () => {
    const primeiro = await cenario('grave');
    await publicarEsperar(primeiro.codigo, primeiro.dispositivoId, 150);
    await fonte.query(`UPDATE alerta SET data_hora = now() - interval '10 years' WHERE regra_alerta_id = $1`, [primeiro.regraId]);
    const segundo = await cenario('grave');
    await publicarEsperar(segundo.codigo, segundo.dispositivoId, 150);
    const r = await resumo();
    expect(r.gravesSemReconhecimento).toBeGreaterThanOrEqual(2);
    expect(r.graveMaisAntigo).toMatchObject({ dispositivo: primeiro.codigo, criticidade: 'grave', situacao: 'aberto' });

    await fonte.query(`UPDATE alerta SET situacao = 'em_atendimento', data_reconhecimento = now() WHERE regra_alerta_id = $1`, [primeiro.regraId]);
    expect((await resumo()).graveMaisAntigo?.dispositivo).not.toBe(primeiro.codigo);
  });

  it('US28-3 a faixa vem do servidor: outro usuário, com outro login, vê o mesmo alerta grave', async () => {
    const { codigo, dispositivoId } = await cenario('grave');
    await publicarEsperar(codigo, dispositivoId, 150);
    const outro = await entrar(app, await criarUsuario(fonte));
    const [meu, dele] = await Promise.all([resumo(), resumo(outro)]);
    expect(dele.gravesSemReconhecimento).toBe(meu.gravesSemReconhecimento);
    expect(dele.graveMaisAntigo?.id).toBe(meu.graveMaisAntigo?.id);
  });

  it('US28-4 o grave sem reconhecimento fica no topo, acima até de um grave mais recente já em atendimento', async () => {
    const antigo = await cenario('grave');
    await publicarEsperar(antigo.codigo, antigo.dispositivoId, 150);
    await fonte.query(`UPDATE alerta SET data_hora = now() - interval '1 hour' WHERE regra_alerta_id = $1`, [antigo.regraId]);
    const recente = await cenario('grave');
    await publicarEsperar(recente.codigo, recente.dispositivoId, 150);
    await fonte.query(`UPDATE alerta SET situacao = 'em_atendimento', data_reconhecimento = now() WHERE regra_alerta_id = $1`, [recente.regraId]);
    const lista: { regraId: string; dispositivoId: string; criticidade: string; situacao: string }[] = (
      await http().get('/api/alertas').set('Authorization', `Bearer ${token}`).expect(200)
    ).body;
    // as regras valem para a cidade toda: o alerta é identificado pela regra e pelo dispositivo
    const posicao = (c: { regraId: string; dispositivoId: string }) =>
      lista.findIndex((a) => a.regraId === c.regraId && a.dispositivoId === c.dispositivoId);
    expect(posicao(antigo)).toBeGreaterThanOrEqual(0);
    expect(posicao(antigo)).toBeLessThan(posicao(recente));
    const primeiroReconhecido = lista.findIndex((a) => !(a.criticidade === 'grave' && a.situacao === 'aberto'));
    expect(lista.slice(primeiroReconhecido).some((a) => a.criticidade === 'grave' && a.situacao === 'aberto')).toBe(false);
  });
});

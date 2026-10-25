import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { criarApp, criarUsuario, entrar } from './apoio';

describe('US02 lista de alertas ativos ordenados por gravidade', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let dispositivoId: string;
  let codigo: string;

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  const listar = async (visao?: string) =>
    (await autenticado(http().get('/api/alertas')).query(visao ? { visao } : {}).expect(200)).body as { id: string; criticidade: string }[];
  const resumo = async () => (await autenticado(http().get('/api/alertas/resumo')).expect(200)).body;

  interface Opcoes {
    criticidade?: string;
    situacao?: string;
    minutosAtras?: number;
    reconhecidoMinutosDepois?: number;
    encerrado?: boolean;
  }

  async function alerta({ criticidade = 'grave', situacao = 'aberto', minutosAtras = 0, reconhecidoMinutosDepois, encerrado }: Opcoes = {}) {
    const [{ id: regraId }] = await fonte.query(
      `INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade)
       VALUES ($1, 'nivel_agua', '>', 3.5, 0, $2) RETURNING id::text`,
      [`Regra ${randomUUID()}`, criticidade],
    );
    const [{ id }] = await fonte.query(
      `INSERT INTO alerta (regra_alerta_id, dispositivo_id, valor_observado, operador, valor_limite, criticidade, situacao,
                           data_hora, data_reconhecimento, data_encerramento)
       VALUES ($1, $2, 3.81, '>', 3.5, $3, $4, now() - $5 * interval '1 minute',
               CASE WHEN $6::int IS NULL THEN NULL ELSE now() - ($5 - $6::int) * interval '1 minute' END,
               CASE WHEN $7 THEN now() END)
       RETURNING id::text`,
      [regraId, dispositivoId, criticidade, encerrado ? 'encerrado' : situacao, minutosAtras, reconhecidoMinutosDepois ?? null, encerrado ?? false],
    );
    return id as string;
  }

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    token = await entrar(app, await criarUsuario(fonte));
    codigo = `U2-${randomUUID().slice(0, 8)}`;
    [{ id: dispositivoId }] = await fonte.query(
      `INSERT INTO dispositivo (identificador, tipo_dispositivo_id, bairro_id, endereco, localizacao, atributos_especificos)
       SELECT $1, t.id, b.id, 'Arroio Olarias, ponte da Av. Visconde de Taunay', ST_PointOnSurface(b.area)::geography, '{"tipoGrandeza": "nivel_agua"}'
         FROM tipo_dispositivo t, bairro b WHERE t.nome = 'Sensor de nível' AND b.nome = 'Olarias'
       RETURNING id::text`,
      [codigo],
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US02-1 a lista traz os campos da tela de alertas', () => {
    it('US02-1 cada alerta traz gravidade, regra, dispositivo, bairro, medição com limite, detecção, órgão e situação', async () => {
      const id = await alerta();
      const item = (await listar()).find((a) => a.id === id);
      expect(item).toMatchObject({
        criticidade: 'grave',
        dispositivo: codigo,
        tipoDispositivo: 'Sensor de nível',
        endereco: 'Arroio Olarias, ponte da Av. Visconde de Taunay',
        bairro: 'Olarias',
        valorObservado: 3.81,
        operador: '>',
        valorLimite: 3.5,
        unidade: 'm',
        situacao: 'aberto',
        orgao: null,
      });
      expect(item).toHaveProperty('regra');
      expect(item).toHaveProperty('dataHora');
    });

    it('US02-1 o órgão vem da ocorrência vinculada ao alerta', async () => {
      const id = await alerta({ situacao: 'em_atendimento' });
      const [{ id: ocorrenciaId }] = await fonte.query(
        `INSERT INTO orgao (nome, sigla) VALUES ('Defesa Civil', 'DC') ON CONFLICT (sigla) DO UPDATE SET nome = EXCLUDED.nome RETURNING id`,
      ).then(([orgao]) =>
        fonte.query(
          `INSERT INTO ocorrencia (protocolo, categoria, criticidade, situacao, orgao_id) VALUES ($1, 'Risco hidrológico', 'grave', 'em_atendimento', $2) RETURNING id::text`,
          [`T-${randomUUID().slice(0, 12)}`, orgao.id],
        ),
      );
      await fonte.query(`UPDATE alerta SET ocorrencia_id = $2 WHERE id = $1`, [id, ocorrenciaId]);
      expect((await listar()).find((a) => a.id === id)).toMatchObject({ orgao: 'Defesa Civil', ocorrenciaId });
    });

    it('US02-1 as visões separam ativos, em atendimento e encerrados hoje', async () => {
      const aberto = await alerta();
      const emAtendimento = await alerta({ situacao: 'em_atendimento' });
      const encerrado = await alerta({ encerrado: true });
      const ids = async (visao?: string) => (await listar(visao)).map((a) => a.id);
      expect(await ids()).toEqual(expect.arrayContaining([aberto, emAtendimento]));
      expect(await ids()).not.toContain(encerrado);
      expect(await ids('em_atendimento')).toContain(emAtendimento);
      expect(await ids('em_atendimento')).not.toContain(aberto);
      expect(await ids('encerrados_hoje')).toContain(encerrado);
      await autenticado(http().get('/api/alertas')).query({ visao: 'todos' }).expect(400);
    });
  });

  it('US02-2 a ordem é grave, atenção e informativo, e o mais recente primeiro na mesma gravidade', async () => {
    const informativo = await alerta({ criticidade: 'informativo', minutosAtras: 1 });
    const graveAntigo = await alerta({ criticidade: 'grave', minutosAtras: 30 });
    const atencao = await alerta({ criticidade: 'atencao', minutosAtras: 2 });
    const graveRecente = await alerta({ criticidade: 'grave', minutosAtras: 3 });
    const meus = new Set([informativo, graveAntigo, atencao, graveRecente]);
    const lista = await listar();
    expect(lista.filter((a) => meus.has(a.id)).map((a) => a.id)).toEqual([graveRecente, graveAntigo, atencao, informativo]);
    const gravidades = lista.map((a) => ['grave', 'atencao', 'informativo'].indexOf(a.criticidade));
    expect(gravidades).toEqual([...gravidades].sort((x, y) => x - y));
  });

  it('US02-3 os indicadores contam ativos, graves sem reconhecimento, em atendimento, encerrados, tempo até o reconhecimento e 24 h', async () => {
    const antes = await resumo();
    await alerta({ criticidade: 'grave' });
    await alerta({ criticidade: 'atencao' });
    const reconhecido = await alerta({ criticidade: 'grave', situacao: 'em_atendimento', minutosAtras: 20, reconhecidoMinutosDepois: 12 });
    await alerta({ encerrado: true, minutosAtras: 60 });
    await alerta({ minutosAtras: 25 * 60, encerrado: true });
    const depois = await resumo();
    expect(depois.ativos - antes.ativos).toBe(3);
    expect(depois.gravesSemReconhecimento - antes.gravesSemReconhecimento).toBe(1);
    expect(depois.emAtendimento - antes.emAtendimento).toBe(1);
    expect(depois.encerradosHoje - antes.encerradosHoje).toBe(2);
    expect(depois.ultimas24h - antes.ultimas24h).toBe(4);
    expect(depois.encerradosUltimas24h - antes.encerradosUltimas24h).toBe(1);

    // banco de teste descartável: deixa só o reconhecimento deste caso na janela de 24 h
    await fonte.query(`UPDATE alerta SET data_reconhecimento = NULL WHERE id <> $1 AND data_reconhecimento >= now() - interval '24 hours'`, [reconhecido]);
    expect((await resumo()).tempoMedioReconhecimentoMinutos).toBe(12);
  });

  it('US02-3 os dispositivos sem comunicação são contados por tipo', async () => {
    const antes = await resumo();
    await fonte.query(
      `INSERT INTO dispositivo (identificador, tipo_dispositivo_id, localizacao, atributos_especificos)
       SELECT $1, id, (SELECT ST_PointOnSurface(area)::geography FROM bairro WHERE nome = 'Olarias'), '{}'
         FROM tipo_dispositivo WHERE nome = 'Câmera'`,
      [`U2-${randomUUID().slice(0, 8)}`],
    );
    const depois = await resumo();
    expect(depois.semComunicacao - antes.semComunicacao).toBe(1);
    const cameras = (r: { semComunicacaoPorTipo: { tipo: string; quantidade: number }[] }) =>
      r.semComunicacaoPorTipo.find((p) => p.tipo === 'Câmera')?.quantidade ?? 0;
    expect(cameras(depois) - cameras(antes)).toBe(1);
  });
});

import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { EventosAlertasService } from '../src/alertas/eventos-alertas.service';
import { VerificacaoComunicacaoService } from '../src/alertas/verificacao-comunicacao.service';
import { IngestaoService } from '../src/ingestao/ingestao.service';
import { criarApp, criarUsuario, entrar } from './apoio';

describe('US07 aviso quando um dispositivo parar de enviar dados', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let tipos: Record<string, string>;
  let ponto: { latitude: number; longitude: number };
  let verificacao: VerificacaoComunicacaoService;

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);

  async function dispositivo(estado = 'ativo', ultimaComunicacao: string | null = "now() - interval '2 hours'") {
    const identificador = `U7-${randomUUID().slice(0, 8)}`;
    const criado = (
      await autenticado(http().post('/api/dispositivos'))
        .send({ identificador, tipoDispositivoId: tipos['Câmera'], ...ponto, estado, atributos: {} })
        .expect(201)
    ).body;
    await fonte.query(`UPDATE dispositivo SET ultima_comunicacao = ${ultimaComunicacao ?? 'NULL'} WHERE id = $1`, [criado.id]);
    return { id: criado.id as string, codigo: identificador };
  }

  const alertasDe = (dispositivoId: string) =>
    fonte.query(
      `SELECT a.id::text AS id, a.situacao, a.criticidade, a.valor_observado::float8 AS valor, a.valor_limite::float8 AS limite, r.nome
         FROM alerta a JOIN regra_alerta r ON r.id = a.regra_alerta_id
        WHERE a.dispositivo_id = $1 AND r.sistema ORDER BY a.id`,
      [dispositivoId],
    );

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    token = await entrar(app, await criarUsuario(fonte));
    const lista = (await autenticado(http().get('/api/tipos-dispositivo')).expect(200)).body;
    tipos = Object.fromEntries(lista.map((t: { nome: string; id: string }) => [t.nome, t.id]));
    [ponto] = await fonte.query(
      `SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE nome = 'Olarias'`,
    );
    verificacao = app.get(VerificacaoComunicacaoService);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US07-1 a rotina verifica a cada minuto e emite o alerta de sem comunicação, de gravidade atenção', () => {
    it('US07-1 a rotina é agendada a cada 60 s quando nada é configurado', () => {
      const anterior = process.env.VERIFICACAO_COMUNICACAO_SEGUNDOS;
      delete process.env.VERIFICACAO_COMUNICACAO_SEGUNDOS;
      const agendar = jest.spyOn(global, 'setInterval');
      const rotina = new VerificacaoComunicacaoService(fonte, app.get(EventosAlertasService));
      try {
        rotina.onModuleInit();
        expect(agendar).toHaveBeenCalledWith(expect.any(Function), 60_000);
      } finally {
        rotina.onModuleDestroy();
        agendar.mockRestore();
        process.env.VERIFICACAO_COMUNICACAO_SEGUNDOS = anterior;
      }
    });

    it('US07-1 dispositivo ativo além do limite da US22 recebe o alerta, com o tempo e o limite em minutos', async () => {
      const parado = await dispositivo();
      const novos = await verificacao.verificar();
      const [alerta] = await alertasDe(parado.id);
      expect(novos).toContain(alerta.id);
      // câmera: intervalo de 30 s do tipo, limite de 60 s
      expect(alerta).toMatchObject({ nome: 'Dispositivo sem comunicação', criticidade: 'atencao', situacao: 'aberto', limite: 1 });
      expect(alerta.valor).toBeGreaterThanOrEqual(119);
      const lista = (await autenticado(http().get('/api/alertas')).expect(200)).body;
      expect(lista.find((a: { id: string }) => a.id === alerta.id)).toMatchObject({ unidade: 'min', regra: 'Dispositivo sem comunicação' });
    });

    it('US07-1 dispositivo dentro do limite não recebe alerta', async () => {
      const ativo = await dispositivo('ativo', 'now()');
      await verificacao.verificar();
      expect(await alertasDe(ativo.id)).toEqual([]);
    });

    it('US07-1 a regra de sistema não aparece na tela de regras', async () => {
      const regras = (await autenticado(http().get('/api/regras-alerta')).expect(200)).body;
      expect(regras.map((r: { nome: string }) => r.nome)).not.toContain('Dispositivo sem comunicação');
      const [{ id }] = await fonte.query(`SELECT id::text FROM regra_alerta WHERE sistema`);
      await autenticado(http().patch(`/api/regras-alerta/${id}`)).send({ valorLimite: 5 }).expect(404);
    });
  });

  it('US07-2 há no máximo um alerta de sem comunicação ativo por dispositivo', async () => {
    const parado = await dispositivo();
    await Promise.all([verificacao.verificar(), verificacao.verificar()]);
    await verificacao.verificar();
    expect(await alertasDe(parado.id)).toHaveLength(1);
  });

  describe('US07-3 o alerta se encerra quando o dispositivo volta a comunicar, se não foi reconhecido', () => {
    it('US07-3 o sinal de vida encerra o alerta aberto', async () => {
      const parado = await dispositivo();
      await verificacao.verificar();
      const [alerta] = await alertasDe(parado.id);
      const resultado = await app.get(IngestaoService).gravar(parado.codigo, { dataHora: new Date(), origem: 'mqtt', leituras: [] });
      expect(resultado.encerrados).toContain(alerta.id);
      expect(await alertasDe(parado.id)).toEqual([expect.objectContaining({ id: alerta.id, situacao: 'encerrado' })]);
    });

    it('US07-3 alerta já reconhecido continua em atendimento', async () => {
      const parado = await dispositivo();
      await verificacao.verificar();
      const [alerta] = await alertasDe(parado.id);
      await autenticado(http().post(`/api/alertas/${alerta.id}/reconhecimento`)).send({ providencia: 'Equipe a caminho.' }).expect(200);
      await app.get(IngestaoService).gravar(parado.codigo, { dataHora: new Date(), origem: 'mqtt', leituras: [] });
      expect((await alertasDe(parado.id))[0].situacao).toBe('em_atendimento');
    });
  });

  it('US07-4 dispositivo em manutenção ou inativo não gera o alerta', async () => {
    const manutencao = await dispositivo('manutencao');
    const inativo = await dispositivo('inativo', null);
    await verificacao.verificar();
    expect(await alertasDe(manutencao.id)).toEqual([]);
    expect(await alertasDe(inativo.id)).toEqual([]);
  });

  it('US07-1 o alerta não muda a cor do dispositivo, que continua sem comunicação', async () => {
    const parado = await dispositivo();
    await verificacao.verificar();
    const lido = (await autenticado(http().get(`/api/dispositivos/${parado.id}`)).expect(200)).body;
    expect(lido).toMatchObject({ situacao: 'sem_comunicacao', alertaAtivo: null });
  });
});

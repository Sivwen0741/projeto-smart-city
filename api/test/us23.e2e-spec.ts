import { INestApplication } from '@nestjs/common';
import { randomBytes } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { criarApp, criarUsuario, entrar, UsuarioDeTeste } from './apoio';

describe('US23 - Configurar os limites que disparam cada regra de alerta', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let usuario: UsuarioDeTeste;
  let token: string;
  let dispositivoId: string;
  const lote = randomBytes(3).toString('hex');
  let sequencia = 0;

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);

  function regra(extra: object = {}) {
    return {
      nome: `Nível do arroio acima da cota ${lote}-${++sequencia}`,
      tipoGrandeza: 'nivel_agua',
      operador: '>',
      valorLimite: 3.2,
      duracaoMinutos: 10,
      criticidade: 'grave',
      ...extra,
    };
  }

  async function cadastrar(dados: object = regra()) {
    return (await autenticado(http().post('/api/regras-alerta')).send(dados).expect(201)).body;
  }

  async function editar(id: string, dados: object, esperado = 200) {
    return (await autenticado(http().patch(`/api/regras-alerta/${id}`)).send(dados).expect(esperado)).body;
  }

  // o motor de alertas é da sprint 5; aqui o disparo é simulado copiando da regra, como o motor fará
  async function dispararAlerta(regraId: string, valorObservado: number) {
    const [{ id }] = await fonte.query(
      `INSERT INTO alerta (regra_alerta_id, dispositivo_id, valor_observado, operador, valor_limite, criticidade, situacao)
       SELECT r.id, $2, $3, r.operador, r.valor_limite, r.criticidade, 'aberto' FROM regra_alerta r WHERE r.id = $1
       RETURNING id::text`,
      [regraId, dispositivoId, valorObservado],
    );
    return id;
  }

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    usuario = await criarUsuario(fonte);
    token = await entrar(app, usuario);
    [{ id: dispositivoId }] = await fonte.query(
      `INSERT INTO dispositivo (identificador, tipo_dispositivo_id, localizacao)
       SELECT $1, t.id, ST_PointOnSurface(b.area)::geography FROM tipo_dispositivo t, bairro b
        WHERE t.nome = 'Sensor de nível' AND b.nome = 'Olarias'
       RETURNING id::text`,
      [`US23-${lote}`],
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US23-1 a regra tem nome, grandeza, operador, valor limite, duração mínima e gravidade', () => {
    it('US23-1 cadastra com todos os campos e devolve cada um deles', async () => {
      const dados = regra();
      const criada = await cadastrar(dados);
      expect(criada).toMatchObject({ ...dados, ativa: true, alertas: 0 });
      expect((await autenticado(http().get(`/api/regras-alerta/${criada.id}`)).expect(200)).body).toEqual(criada);
      const lista = (await autenticado(http().get('/api/regras-alerta')).expect(200)).body;
      expect(lista).toContainEqual(criada);
    });

    it('US23-1 aceita os seis operadores e as três gravidades', async () => {
      for (const operador of ['>', '>=', '<', '<=', '=', '<>']) {
        expect((await cadastrar(regra({ operador }))).operador).toBe(operador);
      }
      for (const criticidade of ['grave', 'atencao', 'informativo']) {
        expect((await cadastrar(regra({ criticidade }))).criticidade).toBe(criticidade);
      }
    });

    it('US23-1 recusa grandeza desconhecida, gravidade inválida e nome vazio', async () => {
      for (const dados of [regra({ tipoGrandeza: 'qualquer' }), regra({ criticidade: 'urgente' }), regra({ nome: '  ' })]) {
        await autenticado(http().post('/api/regras-alerta')).send(dados).expect(400);
      }
    });

    it('US23-1 sem token é recusado', async () => {
      await http().post('/api/regras-alerta').send(regra()).expect(401);
      await http().get('/api/regras-alerta').expect(401);
    });
  });

  describe('US23-2 o valor limite é alterado pela interface, sem mudar código ou configuração', () => {
    it('US23-2 o novo limite vale imediatamente na regra gravada', async () => {
      const criada = await cadastrar();
      const editada = await editar(criada.id, { valorLimite: 3.5 });
      expect(editada.valorLimite).toBe(3.5);
      const [{ valor_limite }] = await fonte.query(`SELECT valor_limite::float8 FROM regra_alerta WHERE id = $1`, [criada.id]);
      expect(valor_limite).toBe(3.5);
    });

    it('US23-2 aceita limite decimal, negativo e zero', async () => {
      const criada = await cadastrar(regra({ tipoGrandeza: 'temperatura', operador: '<' }));
      for (const valorLimite of [0, -2.5, 0.05]) {
        expect((await editar(criada.id, { valorLimite })).valorLimite).toBe(valorLimite);
      }
    });

    it('US23-2 regra inexistente responde 404', async () => {
      await editar('999999999', { valorLimite: 1 }, 404);
    });
  });

  describe('US23-3 a regra é ativada e desativada sem ser excluída, preservando os alertas', () => {
    it('US23-3 desativar e reativar mantém a regra e os alertas já gerados', async () => {
      const criada = await cadastrar();
      const alertaId = await dispararAlerta(criada.id, 3.81);

      const desativada = await editar(criada.id, { ativa: false });
      expect(desativada).toMatchObject({ ativa: false, alertas: 1 });
      const [{ existe }] = await fonte.query(`SELECT count(*)::int AS existe FROM alerta WHERE id = $1`, [alertaId]);
      expect(existe).toBe(1);
      expect((await autenticado(http().get('/api/regras-alerta')).expect(200)).body.find((r: { id: string }) => r.id === criada.id).ativa).toBe(false);

      expect((await editar(criada.id, { ativa: true })).ativa).toBe(true);
    });

    it('US23-3 não existe rota de exclusão', async () => {
      const criada = await cadastrar();
      await autenticado(http().delete(`/api/regras-alerta/${criada.id}`)).expect(404);
      await autenticado(http().get(`/api/regras-alerta/${criada.id}`)).expect(200);
    });

    it('US23-3 a regra pode nascer desativada', async () => {
      expect((await cadastrar(regra({ ativa: false }))).ativa).toBe(false);
    });
  });

  describe('US23-4 alterar a regra não muda os alertas emitidos antes', () => {
    it('US23-4 o alerta guarda operador, limite e gravidade da época do disparo', async () => {
      const criada = await cadastrar(regra({ operador: '>', valorLimite: 3.2, criticidade: 'atencao' }));
      const alertaId = await dispararAlerta(criada.id, 3.4);

      await editar(criada.id, { operador: '>=', valorLimite: 3.5, criticidade: 'grave' });

      const [alerta] = await fonte.query(
        `SELECT operador, valor_limite::float8 AS limite, criticidade, valor_observado::float8 AS observado FROM alerta WHERE id = $1`,
        [alertaId],
      );
      expect(alerta).toEqual({ operador: '>', limite: 3.2, criticidade: 'atencao', observado: 3.4 });
    });
  });

  describe('US23-5 não salva regra com limite vazio, operador não selecionado ou duração negativa', () => {
    it('US23-5 cadastro recusado com mensagem para cada caso', async () => {
      const casos: [object, string][] = [
        [regra({ valorLimite: undefined }), 'Informe o valor limite.'],
        [regra({ valorLimite: null }), 'Informe o valor limite.'],
        [regra({ valorLimite: '' }), 'Informe o valor limite.'],
        [regra({ operador: undefined }), 'Escolha o operador de comparação.'],
        [regra({ operador: '' }), 'Escolha o operador de comparação.'],
        [regra({ duracaoMinutos: -5 }), 'A duração mínima não pode ser negativa.'],
      ];
      for (const [dados, mensagem] of casos) {
        const resposta = await autenticado(http().post('/api/regras-alerta')).send(dados).expect(400);
        expect(resposta.body.message).toContain(mensagem);
      }
    });

    it('US23-5 edição recusada nos mesmos casos, sem alterar a regra', async () => {
      const criada = await cadastrar();
      const casos: [object, string][] = [
        [{ valorLimite: null }, 'Informe o valor limite.'],
        [{ operador: null }, 'Escolha o operador de comparação.'],
        [{ operador: '!' }, 'Escolha o operador de comparação.'],
        [{ duracaoMinutos: -1 }, 'A duração mínima não pode ser negativa.'],
      ];
      for (const [dados, mensagem] of casos) {
        const resposta = await autenticado(http().patch(`/api/regras-alerta/${criada.id}`)).send(dados).expect(400);
        expect(resposta.body.message).toContain(mensagem);
      }
      expect((await autenticado(http().get(`/api/regras-alerta/${criada.id}`)).expect(200)).body).toEqual(criada);
    });

    it('US23-5 duração zero é aceita: dispara na primeira leitura', async () => {
      expect((await cadastrar(regra({ duracaoMinutos: 0 }))).duracaoMinutos).toBe(0);
    });
  });

  describe('US23-6 cada alteração gera registro no log com o valor anterior e o novo', () => {
    async function registros(id: string) {
      return fonte.query(
        `SELECT acao, usuario_id::text AS usuario_id, detalhes FROM log_atividade
          WHERE entidade_afetada = 'regra_alerta' AND entidade_id = $1 ORDER BY id`,
        [id],
      );
    }

    it('US23-6 registra cadastro e cada edição com autor, antes e depois', async () => {
      const criada = await cadastrar(regra({ valorLimite: 3.2 }));
      await editar(criada.id, { valorLimite: 3.5 });
      await editar(criada.id, { ativa: false, duracaoMinutos: 15 });

      const log = await registros(criada.id);
      expect(log.map((r: { acao: string }) => r.acao)).toEqual(['cadastro_regra_alerta', 'edicao_regra_alerta', 'edicao_regra_alerta']);
      expect(log.every((r: { usuario_id: string }) => r.usuario_id === usuario.id)).toBe(true);
      expect(log[0].detalhes.depois.valorLimite).toBe(3.2);
      expect(log[1].detalhes).toEqual({ antes: { valorLimite: 3.2 }, depois: { valorLimite: 3.5 } });
      expect(log[2].detalhes).toEqual({ antes: { ativa: true, duracaoMinutos: 10 }, depois: { ativa: false, duracaoMinutos: 15 } });
    });

    it('US23-6 o histórico de alterações da regra mostra o autor e os valores', async () => {
      const criada = await cadastrar(regra({ valorLimite: 3.2 }));
      await editar(criada.id, { valorLimite: 3.5 });
      const historico = (await autenticado(http().get(`/api/regras-alerta/${criada.id}/alteracoes`)).expect(200)).body;
      expect(historico).toHaveLength(2);
      expect(historico[0]).toMatchObject({ acao: 'edicao_regra_alerta', autor: 'Usuário de teste', antes: { valorLimite: 3.2 }, depois: { valorLimite: 3.5 } });
      expect(historico[1].acao).toBe('cadastro_regra_alerta');
    });

    it('US23-6 edição sem mudança e edição recusada não geram registro', async () => {
      const criada = await cadastrar();
      await editar(criada.id, { valorLimite: criada.valorLimite });
      await editar(criada.id, { duracaoMinutos: -1 }, 400);
      expect((await registros(criada.id)).map((r: { acao: string }) => r.acao)).toEqual(['cadastro_regra_alerta']);
    });
  });
});

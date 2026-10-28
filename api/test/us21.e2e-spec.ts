import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { criarApp, criarUsuario, entrar, UsuarioDeTeste } from './apoio';

interface Perfil {
  id: string;
  nome: string;
  permissoes: string[];
}

describe('US21 gerenciar usuários e perfis de acesso por órgão', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let admin: UsuarioDeTeste;
  let tokenAdmin: string;
  let perfis: Record<string, Perfil>;
  let orgaos: Record<string, string>;
  let ponto: { latitude: number; longitude: number };

  const http = () => request(app.getHttpServer());
  const como = (token: string) => ({
    get: (url: string) => http().get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => http().post(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) => http().patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => http().delete(url).set('Authorization', `Bearer ${token}`),
  });
  const emailNovo = () => `pessoa.${randomUUID().slice(0, 8)}@pontagrossa.pr.gov.br`;
  const cadastrar = (corpo: object) => como(tokenAdmin).post('/api/usuarios').send(corpo);
  const login = (email: string, senha: string) => http().post('/api/auth/login').send({ email, senha });
  const logs = (entidadeId: string) =>
    fonte.query(
      `SELECT acao, usuario_id::text AS "usuarioId", detalhes FROM log_atividade WHERE entidade_afetada = 'usuario' AND entidade_id = $1 AND acao <> 'autenticacao' ORDER BY id`,
      [entidadeId],
    );
  const tokenDe = async (perfil: string, orgao = 'DTI') => entrar(app, await criarUsuario(fonte, { perfil, orgao }));
  const ocorrencia = async (orgao: string | null) =>
    (
      await como(tokenAdmin)
        .post('/api/ocorrencias')
        .send({ categoria: 'Alagamento', criticidade: 'atencao', orgaoId: orgao ? orgaos[orgao] : null, descricao: 'Teste da US21.', ...ponto })
        .expect(201)
    ).body.id as string;

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    admin = await criarUsuario(fonte);
    tokenAdmin = await entrar(app, admin);
    const lista: Perfil[] = (await como(tokenAdmin).get('/api/perfis').expect(200)).body;
    perfis = Object.fromEntries(lista.map((p) => [p.nome, p]));
    const listaOrgaos = (await como(tokenAdmin).get('/api/orgaos').expect(200)).body;
    orgaos = Object.fromEntries(listaOrgaos.map((o: { sigla: string; id: string }) => [o.sigla, o.id]));
    [ponto] = await fonte.query(
      `SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE nome = 'Centro'`,
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US21-1 o administrador cadastra, edita e inativa usuários, sem excluir', () => {
    it('US21-1 cadastra com nome, e-mail funcional, órgão e perfil, e a senha provisória entra', async () => {
      const email = emailNovo();
      const { body } = await cadastrar({ nome: '  Helena Baptista ', email: email.toUpperCase(), orgaoId: orgaos.DC, perfilId: perfis.operador.id }).expect(201);
      expect(body.usuario).toMatchObject({ nome: 'Helena Baptista', email, orgao: 'Defesa Civil', perfil: 'operador', ativo: true, ultimoAcesso: null });
      expect(body.senhaProvisoria).toMatch(/^[a-z2-9]{12}$/);
      const sessao = (await login(email, body.senhaProvisoria).expect(200)).body;
      expect(sessao.usuario).toMatchObject({ perfil: 'operador', orgao: 'DC', orgaoId: orgaos.DC, permissoes: ['consultar', 'operar'] });
      const listado = (await como(tokenAdmin).get('/api/usuarios').expect(200)).body.find((u: { id: string }) => u.id === body.usuario.id);
      expect(listado.ultimoAcesso).not.toBeNull();
    });

    it('US21-1 recusa e-mail fora do domínio funcional, e-mail repetido, órgão ou perfil inexistente e campo vazio', async () => {
      const base = { nome: 'Fulano', orgaoId: orgaos.DC, perfilId: perfis.consulta.id };
      const recusa = async (corpo: object, status: number) => (await cadastrar(corpo).expect(status)).body.message;
      expect(await recusa({ ...base, email: 'fulano@gmail.com' }, 400)).toEqual(['Use o e-mail funcional (@pontagrossa.pr.gov.br).']);
      expect(await recusa({ ...base, email: admin.email.toUpperCase() }, 409)).toBe(`O e-mail ${admin.email} já está cadastrado.`);
      expect(await recusa({ ...base, email: emailNovo(), orgaoId: '999999' }, 400)).toBe('Órgão não encontrado.');
      expect(await recusa({ ...base, email: emailNovo(), perfilId: '999999' }, 400)).toBe('Perfil não encontrado.');
      expect(await recusa({ ...base, email: emailNovo(), nome: '   ' }, 400)).toEqual(['Informe o nome.']);
    });

    it('US21-1 edita nome, órgão e perfil', async () => {
      const { usuario } = (await cadastrar({ nome: 'Ana', email: emailNovo(), orgaoId: orgaos.DC, perfilId: perfis.consulta.id }).expect(201)).body;
      const { body } = await como(tokenAdmin).patch(`/api/usuarios/${usuario.id}`).send({ nome: 'Ana Souza', orgaoId: orgaos.MOB, perfilId: perfis.gestor.id }).expect(200);
      expect(body).toMatchObject({ nome: 'Ana Souza', orgao: 'Mobilidade', perfil: 'gestor', ativo: true });
    });

    it('US21-1 inativa sem excluir: o usuário deixa de entrar, a sessão aberta cai e ele continua na lista', async () => {
      const { usuario, senhaProvisoria } = (await cadastrar({ nome: 'Bruno', email: emailNovo(), orgaoId: orgaos.DC, perfilId: perfis.operador.id }).expect(201)).body;
      const token = (await login(usuario.email, senhaProvisoria).expect(200)).body.token;
      await como(tokenAdmin).patch(`/api/usuarios/${usuario.id}`).send({ ativo: false }).expect(200);
      await login(usuario.email, senhaProvisoria).expect(401);
      await como(token).get('/api/painel').expect(401);
      const lista = (await como(tokenAdmin).get('/api/usuarios').expect(200)).body;
      expect(lista.find((u: { id: string }) => u.id === usuario.id)).toMatchObject({ ativo: false });
      await como(tokenAdmin).delete(`/api/usuarios/${usuario.id}`).expect(404);
      await como(tokenAdmin).patch(`/api/usuarios/${usuario.id}`).send({ ativo: true }).expect(200);
      await login(usuario.email, senhaProvisoria).expect(200);
    });

    it('US21-1 o administrador não inativa nem muda o próprio perfil', async () => {
      await como(tokenAdmin).patch(`/api/usuarios/${admin.id}`).send({ ativo: false }).expect(409);
      await como(tokenAdmin).patch(`/api/usuarios/${admin.id}`).send({ perfilId: perfis.consulta.id }).expect(409);
    });

    it('US21-1 nova senha provisória substitui a anterior', async () => {
      const { usuario, senhaProvisoria } = (await cadastrar({ nome: 'Carla', email: emailNovo(), orgaoId: orgaos.DC, perfilId: perfis.consulta.id }).expect(201)).body;
      const nova = (await como(tokenAdmin).post(`/api/usuarios/${usuario.id}/senha-provisoria`).expect(200)).body.senhaProvisoria;
      expect(nova).not.toBe(senhaProvisoria);
      await login(usuario.email, senhaProvisoria).expect(401);
      await login(usuario.email, nova).expect(200);
    });
  });

  describe('US21-2 os perfis têm permissões e as rotas recusam com 403 o que o perfil não permite', () => {
    it('US21-2 os quatro perfis acumulam consultar, operar, configurar e administrar', () => {
      expect(Object.values(perfis).map((p) => [p.nome, p.permissoes])).toEqual([
        ['consulta', ['consultar']],
        ['operador', ['consultar', 'operar']],
        ['gestor', ['consultar', 'operar', 'configurar']],
        ['administrador', ['consultar', 'operar', 'configurar', 'administrar']],
      ]);
    });

    it.each([
      ['consulta', [200, 403, 403, 403, 403]],
      ['operador', [200, 400, 403, 403, 403]],
      ['gestor', [200, 400, 400, 400, 403]],
      ['administrador', [200, 400, 400, 400, 200]],
    ])('US21-2 perfil %s: consultar, operar, configurar dispositivo, configurar regra e administrar', async (perfil, esperado) => {
      const c = como(await tokenDe(perfil));
      // corpo vazio: quem tem a permissão recebe 400 da validação, quem não tem é barrado antes, com 403
      const obtido = [
        (await c.get('/api/painel')).status,
        (await c.post('/api/ocorrencias').send({})).status,
        (await c.post('/api/dispositivos').send({})).status,
        (await c.post('/api/regras-alerta').send({})).status,
        (await c.get('/api/usuarios')).status,
      ];
      expect(obtido).toEqual(esperado);
    });

    it('US21-2 o perfil de consulta não reconhece alerta nem registra providência, e a recusa explica o motivo', async () => {
      const c = como(await tokenDe('consulta'));
      const recusa = await c.post('/api/alertas/1/reconhecimento').send({ providencia: 'x' }).expect(403);
      expect(recusa.body.message).toBe('Seu perfil não permite esta ação.');
      await c.post(`/api/ocorrencias/${await ocorrencia(null)}/providencias`).send({ observacao: 'x' }).expect(403);
      await c.patch('/api/usuarios/1').send({ ativo: false }).expect(403);
    });
  });

  describe('US21-3 usuário de um órgão vê as ocorrências de todos, mas só atualiza as do próprio órgão', () => {
    it('US21-3 operador da Defesa Civil vê a ocorrência da Mobilidade e não a atualiza; atualiza a da Defesa Civil', async () => {
      const c = como(await tokenDe('operador', 'DC'));
      const daMobilidade = await ocorrencia('MOB');
      const daDefesa = await ocorrencia('DC');
      expect((await c.get('/api/ocorrencias').expect(200)).body.map((o: { id: string }) => o.id)).toEqual(expect.arrayContaining([daMobilidade, daDefesa]));
      await c.get(`/api/ocorrencias/${daMobilidade}`).expect(200);
      const recusa = await c.post(`/api/ocorrencias/${daMobilidade}/providencias`).send({ observacao: 'Equipe a caminho.' }).expect(403);
      expect(recusa.body.message).toMatch(/é do órgão Mobilidade; só esse órgão pode atualizá-la\.$/);
      await c.post(`/api/ocorrencias/${daDefesa}/providencias`).send({ observacao: 'Equipe a caminho.' }).expect(200);
    });

    it('US21-3 ocorrência sem órgão pode ser atualizada por qualquer operador, e o administrador atualiza a de qualquer órgão', async () => {
      await como(await tokenDe('operador', 'MOB')).post(`/api/ocorrencias/${await ocorrencia(null)}/providencias`).send({ observacao: 'Assumida.' }).expect(200);
      await como(tokenAdmin).post(`/api/ocorrencias/${await ocorrencia('SMMA')}/providencias`).send({ observacao: 'Corrigida.' }).expect(200);
    });
  });

  describe('US21-4 toda alteração de usuário ou perfil gera registro no log de atividades', () => {
    it('US21-4 cadastro, edição de perfil e órgão, inativação e nova senha ficam no log com o autor', async () => {
      const { usuario } = (await cadastrar({ nome: 'Diego', email: emailNovo(), orgaoId: orgaos.DC, perfilId: perfis.consulta.id }).expect(201)).body;
      await como(tokenAdmin).patch(`/api/usuarios/${usuario.id}`).send({ perfilId: perfis.operador.id, orgaoId: orgaos.MOB }).expect(200);
      await como(tokenAdmin).patch(`/api/usuarios/${usuario.id}`).send({ ativo: false }).expect(200);
      await como(tokenAdmin).patch(`/api/usuarios/${usuario.id}`).send({ ativo: false }).expect(200);
      await como(tokenAdmin).post(`/api/usuarios/${usuario.id}/senha-provisoria`).expect(200);
      const registros = await logs(usuario.id);
      expect(registros.map((r: { acao: string }) => r.acao)).toEqual(['cadastro_usuario', 'edicao_usuario', 'edicao_usuario', 'senha_provisoria_usuario']);
      expect(registros.every((r: { usuarioId: string }) => r.usuarioId === admin.id)).toBe(true);
      expect(registros[0].detalhes.depois).toMatchObject({ nome: 'Diego', perfil: 'consulta', orgao: 'Defesa Civil', ativo: true });
      expect(registros[1].detalhes).toEqual({ antes: { orgao: 'Defesa Civil', perfil: 'consulta' }, depois: { orgao: 'Mobilidade', perfil: 'operador' } });
      expect(registros[2].detalhes).toEqual({ antes: { ativo: true }, depois: { ativo: false } });
      expect(JSON.stringify(registros)).not.toMatch(/senha_hash|senhaProvisoria/);
    });
  });
});

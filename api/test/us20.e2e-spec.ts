import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { MENSAGEM_CREDENCIAL_INVALIDA } from '../src/auth/auth.service';
import { criarApp, criarUsuario, entrar } from './apoio';

const ROTAS_PUBLICAS = ['POST /api/auth/login', 'GET /api/health'];

describe('US20 - Autenticar os usuários com credenciais individuais', () => {
  let app: INestApplication;
  let fonte: DataSource;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US20-1 acesso com e-mail funcional e senha; nenhuma outra rota responde sem token válido', () => {
    it('US20-1 autentica com e-mail e senha e acessa rota protegida com o token', async () => {
      const usuario = await criarUsuario(fonte);
      const token = await entrar(app, usuario);
      const resposta = await http().get('/api/auth/eu').set('Authorization', `Bearer ${token}`).expect(200);
      expect(resposta.body.email).toBe(usuario.email);
    });

    it('US20-1 toda rota documentada fora login e health responde 401 sem token', async () => {
      const documento = (await http().get('/api/docs-json').expect(200)).body;
      const protegidas = Object.entries(documento.paths as Record<string, object>)
        .flatMap(([caminho, metodos]) => Object.keys(metodos).map((m) => `${m.toUpperCase()} ${caminho}`))
        .filter((rota) => !ROTAS_PUBLICAS.includes(rota));
      expect(protegidas.length).toBeGreaterThan(0);
      for (const rota of protegidas) {
        const [metodo, caminho] = rota.split(' ');
        const url = caminho.replace(/\{[^}]+\}/g, '1');
        const resposta = await (http() as any)[metodo.toLowerCase()](url);
        expect(`${rota} ${resposta.status}`).toBe(`${rota} 401`);
      }
    });

    it('US20-1 token adulterado ou assinado com outro segredo é recusado', async () => {
      const token = await entrar(app, await criarUsuario(fonte));
      const adulterado = token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa');
      const outroSegredo = new JwtService({ secret: 'outro-segredo-qualquer-com-mais-de-32-caracteres' }).sign({ sub: '1' });
      for (const t of [adulterado, outroSegredo, 'qualquer-coisa']) {
        await http().get('/api/auth/eu').set('Authorization', `Bearer ${t}`).expect(401);
      }
    });

    it('US20-1 a documentação Swagger é pública, como exceção registrada', async () => {
      await http().get('/api/docs').expect(200);
    });

    it('US20-1 requisição de login sem senha é recusada com 400', async () => {
      await http().post('/api/auth/login').send({ email: 'alguem@pontagrossa.pr.gov.br' }).expect(400);
    });
  });

  describe('US20-2 senha gravada apenas como hash e verificada no servidor', () => {
    it('US20-2 o banco guarda hash argon2id, nunca a senha em texto puro', async () => {
      const usuario = await criarUsuario(fonte);
      const [{ senha_hash }] = await fonte.query(`SELECT senha_hash FROM usuario WHERE id = $1`, [usuario.id]);
      expect(senha_hash).toMatch(/^\$argon2id\$/);
      expect(senha_hash).not.toContain(usuario.senha);
    });

    it('US20-2 a resposta da API nunca expõe o hash da senha', async () => {
      const usuario = await criarUsuario(fonte);
      const login = await http().post('/api/auth/login').send({ email: usuario.email, senha: usuario.senha }).expect(200);
      const eu = await http().get('/api/auth/eu').set('Authorization', `Bearer ${login.body.token}`).expect(200);
      expect(JSON.stringify([login.body, eu.body])).not.toMatch(/senha|argon2/i);
    });
  });

  describe('US20-3 credencial inválida retorna mensagem genérica', () => {
    it('US20-3 e-mail inexistente e senha errada têm a mesma resposta', async () => {
      const usuario = await criarUsuario(fonte);
      const senhaErrada = await http().post('/api/auth/login').send({ email: usuario.email, senha: 'senha-errada' });
      const emailInexistente = await http()
        .post('/api/auth/login')
        .send({ email: 'ninguem.aqui@pontagrossa.pr.gov.br', senha: 'senha-errada' });
      expect(senhaErrada.status).toBe(401);
      expect(emailInexistente.status).toBe(401);
      expect(senhaErrada.body).toEqual(emailInexistente.body);
      expect(senhaErrada.body.message).toBe(MENSAGEM_CREDENCIAL_INVALIDA);
    });
  });

  describe('US20-4 token expira em oito horas', () => {
    it('US20-4 o token emitido vale exatamente oito horas', async () => {
      const usuario = await criarUsuario(fonte);
      const antes = Date.now();
      const resposta = await http().post('/api/auth/login').send({ email: usuario.email, senha: usuario.senha }).expect(200);
      const { iat, exp } = JSON.parse(Buffer.from(resposta.body.token.split('.')[1], 'base64url').toString());
      expect(exp - iat).toBe(8 * 60 * 60);
      const expiraEm = new Date(resposta.body.expiraEm).getTime();
      expect(Math.abs(expiraEm - (antes + 8 * 3600 * 1000))).toBeLessThan(5000);
    });

    it('US20-4 token vencido é recusado', async () => {
      const usuario = await criarUsuario(fonte);
      const vencido = app.get(JwtService).sign({ sub: usuario.id, iat: Math.floor(Date.now() / 1000) - 8 * 3600 - 1 }, { expiresIn: 8 * 3600 });
      await http().get('/api/auth/eu').set('Authorization', `Bearer ${vencido}`).expect(401);
    });
  });

  describe('US20-5 usuário inativo não autentica', () => {
    it('US20-5 usuário inativo com a senha correta recebe a mesma mensagem genérica', async () => {
      const usuario = await criarUsuario(fonte, { ativo: false });
      const resposta = await http().post('/api/auth/login').send({ email: usuario.email, senha: usuario.senha }).expect(401);
      expect(resposta.body.message).toBe(MENSAGEM_CREDENCIAL_INVALIDA);
    });

    it('US20-5 o token de um usuário inativado deixa de valer', async () => {
      const usuario = await criarUsuario(fonte);
      const token = await entrar(app, usuario);
      await fonte.query(`UPDATE usuario SET ativo = false WHERE id = $1`, [usuario.id]);
      await http().get('/api/auth/eu').set('Authorization', `Bearer ${token}`).expect(401);
    });
  });

  describe('US20-6 último acesso atualizado a cada autenticação bem-sucedida', () => {
    it('US20-6 o último acesso muda no login com sucesso e não muda na falha', async () => {
      const usuario = await criarUsuario(fonte);
      const ultimoAcesso = async () =>
        (await fonte.query(`SELECT ultimo_acesso FROM usuario WHERE id = $1`, [usuario.id]))[0].ultimo_acesso;

      expect(await ultimoAcesso()).toBeNull();
      await entrar(app, usuario);
      const primeiro = await ultimoAcesso();
      expect(primeiro).toBeInstanceOf(Date);

      await http().post('/api/auth/login').send({ email: usuario.email, senha: 'senha-errada' }).expect(401);
      expect(await ultimoAcesso()).toEqual(primeiro);

      await entrar(app, usuario);
      expect((await ultimoAcesso()).getTime()).toBeGreaterThan(primeiro.getTime());
    });
  });

  describe('US20-7 toda tentativa gera registro no log com data, hora e endereço de origem', () => {
    const registros = (email: string) =>
      fonte.query(
        `SELECT usuario_id, acao, detalhes, endereco_ip, data_hora FROM log_atividade
          WHERE acao = 'autenticacao' AND (detalhes->>'email' = $1 OR usuario_id = (SELECT id FROM usuario WHERE email = $1))
          ORDER BY id`,
        [email],
      );

    it('US20-7 sucesso e falha de um usuário existente ficam registrados', async () => {
      const usuario = await criarUsuario(fonte);
      await http().post('/api/auth/login').send({ email: usuario.email, senha: 'senha-errada' }).expect(401);
      await entrar(app, usuario);

      const log = await registros(usuario.email);
      expect(log).toHaveLength(2);
      expect(log.map((r: any) => r.detalhes.resultado)).toEqual(['falha', 'sucesso']);
      for (const r of log) {
        expect(r.usuario_id).toBe(usuario.id);
        expect(r.endereco_ip).toBeTruthy();
        expect(r.data_hora).toBeInstanceOf(Date);
      }
    });

    it('US20-7 tentativa com e-mail inexistente também é registrada', async () => {
      const email = `inexistente.${Date.now()}@pontagrossa.pr.gov.br`;
      await http().post('/api/auth/login').send({ email, senha: 'qualquer' }).expect(401);
      const [registro] = await registros(email);
      expect(registro).toMatchObject({ usuario_id: null, detalhes: { resultado: 'falha', email } });
      expect(registro.endereco_ip).toBeTruthy();
    });
  });
});

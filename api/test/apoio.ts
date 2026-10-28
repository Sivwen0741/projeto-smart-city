import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { gerarHashSenha } from '../src/auth/senha';
import { configurar } from '../src/configurar';
import { preparar } from '../src/database/preparar';

export async function criarApp(): Promise<{ app: INestApplication; fonte: DataSource }> {
  const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = modulo.createNestApplication();
  configurar(app);
  await app.init();
  const fonte = app.get(DataSource);
  await preparar(fonte);
  return { app, fonte };
}

export interface UsuarioDeTeste {
  id: string;
  email: string;
  senha: string;
}

export async function criarUsuario(
  fonte: DataSource,
  opcoes: { ativo?: boolean; perfil?: string; orgao?: string } = {},
): Promise<UsuarioDeTeste> {
  const email = `teste.${randomUUID()}@pontagrossa.pr.gov.br`;
  const senha = `senha-${randomUUID()}`;
  const [{ id }] = await fonte.query(
    `INSERT INTO usuario (orgao_id, perfil_id, nome, email, senha_hash, ativo)
     VALUES ((SELECT id FROM orgao WHERE sigla = $4), (SELECT id FROM perfil WHERE nome = $5),
             'Usuário de teste', $1, $2, $3) RETURNING id`,
    [email, await gerarHashSenha(senha), opcoes.ativo ?? true, opcoes.orgao ?? 'DTI', opcoes.perfil ?? 'administrador'],
  );
  return { id, email, senha };
}

export async function entrar(app: INestApplication, usuario: UsuarioDeTeste): Promise<string> {
  const resposta = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: usuario.email, senha: usuario.senha })
    .expect(200);
  return resposta.body.token;
}

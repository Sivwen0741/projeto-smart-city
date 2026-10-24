import * as argon2 from 'argon2';

export const gerarHashSenha = (senha: string) => argon2.hash(senha, { type: argon2.argon2id });

export const verificarSenha = (hash: string, senha: string) => argon2.verify(hash, senha);

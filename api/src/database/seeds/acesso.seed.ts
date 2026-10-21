import { DataSource } from 'typeorm';
import { gerarHashSenha } from '../../auth/senha';

export async function carregarAcesso(fonte: DataSource): Promise<void> {
  const [orgao] = await fonte.query(
    `INSERT INTO orgao (nome, sigla) VALUES ('Departamento de Tecnologia da Informação', 'DTI')
     ON CONFLICT (sigla) DO UPDATE SET nome = EXCLUDED.nome RETURNING id`,
  );
  const [perfil] = await fonte.query(
    `INSERT INTO perfil (nome, descricao) VALUES ('administrador', 'Cadastros, regras de alerta e controle de acesso')
     ON CONFLICT (nome) DO UPDATE SET descricao = EXCLUDED.descricao RETURNING id`,
  );

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_SENHA;
  if (!email || !senha) {
    console.warn('ADMIN_EMAIL ou ADMIN_SENHA não definidos: usuário administrador inicial não criado');
    return;
  }
  const [existente] = await fonte.query(`SELECT id FROM usuario WHERE lower(email) = $1`, [email]);
  if (existente) return;

  await fonte.query(
    `INSERT INTO usuario (orgao_id, perfil_id, nome, email, senha_hash) VALUES ($1, $2, $3, $4, $5)`,
    [orgao.id, perfil.id, process.env.ADMIN_NOME?.trim() || 'Administrador', email, await gerarHashSenha(senha)],
  );
  console.log(`usuário administrador inicial criado: ${email}`);
}

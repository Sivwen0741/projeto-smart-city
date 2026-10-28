import { DataSource } from 'typeorm';
import { Permissao } from '../../auth/permissao.decorator';
import { gerarHashSenha } from '../../auth/senha';

const PERMISSOES_DESCRITAS: { codigo: Permissao; descricao: string }[] = [
  { codigo: 'consultar', descricao: 'Ver painel, mapa, alertas, ocorrências, dispositivos e regras' },
  { codigo: 'operar', descricao: 'Reconhecer alertas, registrar ocorrências e providências' },
  { codigo: 'configurar', descricao: 'Cadastrar dispositivos e regras de alerta' },
  { codigo: 'administrar', descricao: 'Gerenciar usuários e perfis' },
];

// perfis fixos da prancheta da sprint 6, cada um com as permissões do anterior
export const PERFIS: { nome: string; descricao: string; permissoes: Permissao[] }[] = [
  { nome: 'consulta', descricao: 'Acompanha a cidade sem alterar dados', permissoes: ['consultar'] },
  { nome: 'operador', descricao: 'Atende alertas e ocorrências', permissoes: ['consultar', 'operar'] },
  { nome: 'gestor', descricao: 'Configura dispositivos e regras de alerta', permissoes: ['consultar', 'operar', 'configurar'] },
  { nome: 'administrador', descricao: 'Cadastros, regras de alerta e controle de acesso', permissoes: ['consultar', 'operar', 'configurar', 'administrar'] },
];

export async function carregarAcesso(fonte: DataSource): Promise<void> {
  const [orgao] = await fonte.query(
    `INSERT INTO orgao (nome, sigla) VALUES ('Departamento de Tecnologia da Informação', 'DTI')
     ON CONFLICT (sigla) DO UPDATE SET nome = EXCLUDED.nome RETURNING id`,
  );
  for (const p of PERMISSOES_DESCRITAS) {
    await fonte.query(
      `INSERT INTO permissao (codigo, descricao) VALUES ($1, $2) ON CONFLICT (codigo) DO UPDATE SET descricao = EXCLUDED.descricao`,
      [p.codigo, p.descricao],
    );
  }
  for (const p of PERFIS) {
    await fonte.query(
      `INSERT INTO perfil (nome, descricao) VALUES ($1, $2) ON CONFLICT (nome) DO UPDATE SET descricao = EXCLUDED.descricao`,
      [p.nome, p.descricao],
    );
    await fonte.query(
      `INSERT INTO perfil_permissao (perfil_id, permissao_id)
       SELECT pf.id, pm.id FROM perfil pf, permissao pm WHERE pf.nome = $1 AND pm.codigo = ANY($2)
       ON CONFLICT DO NOTHING`,
      [p.nome, p.permissoes],
    );
  }
  const [perfil] = await fonte.query(`SELECT id FROM perfil WHERE nome = 'administrador'`);

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

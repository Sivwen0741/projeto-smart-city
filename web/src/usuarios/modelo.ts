import { api } from '../sessao/api';
import type { Permissao } from '../sessao/sessao';

export const DOMINIO_FUNCIONAL = 'pontagrossa.pr.gov.br';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  orgaoId: string;
  orgao: string;
  perfilId: string;
  perfil: string;
  ativo: boolean;
  ultimoAcesso: string | null;
}

export interface Perfil {
  id: string;
  nome: string;
  descricao: string | null;
  permissoes: Permissao[];
}

export interface DadosUsuario {
  nome: string;
  email: string;
  orgaoId: string;
  perfilId: string;
  ativo?: boolean;
}

export const ROTULOS_PERFIL: Record<string, string> = {
  consulta: 'Consulta',
  operador: 'Operador',
  gestor: 'Gestor',
  administrador: 'Administrador',
};

export const usuariosApi = {
  listar: () => api<Usuario[]>('/usuarios'),
  perfis: () => api<Perfil[]>('/perfis'),
  criar: (dados: DadosUsuario) => api<{ usuario: Usuario; senhaProvisoria: string }>('/usuarios', { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (id: string, dados: Partial<DadosUsuario>) => api<Usuario>(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
  gerarSenha: (id: string) => api<{ senhaProvisoria: string }>(`/usuarios/${id}/senha-provisoria`, { method: 'POST' }),
};

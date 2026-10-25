import type { Criticidade } from '../dispositivos/modelo';
import { api } from '../sessao/api';

export interface Ocorrencia {
  id: string;
  protocolo: string;
  categoria: string;
  descricao: string | null;
  criticidade: Criticidade;
  situacao: string;
  origem: 'telefone' | 'alerta';
  endereco: string | null;
  orgaoId: string | null;
  orgao: string | null;
  registradaPor: string | null;
  latitude: number | null;
  longitude: number | null;
  bairro: string | null;
  dataAbertura: string;
}

export const SITUACOES_OCORRENCIA: Record<string, string> = {
  aberta: 'Aberta',
  em_atendimento: 'Em atendimento',
  encerrada: 'Encerrada',
};

export interface DadosOcorrencia {
  categoria: string;
  criticidade: Criticidade;
  orgaoId: string | null;
  descricao: string;
  latitude: number;
  longitude: number;
  endereco: string;
  alertaId?: string;
}

export interface Orgao {
  id: string;
  nome: string;
  sigla: string;
}

export const ocorrenciasApi = {
  abertas: () => api<Ocorrencia[]>('/ocorrencias'),
  categorias: () => api<string[]>('/ocorrencias/categorias'),
  orgaos: () => api<Orgao[]>('/orgaos'),
  registrar: (dados: DadosOcorrencia) => api<Ocorrencia>('/ocorrencias', { method: 'POST', body: JSON.stringify(dados) }),
};

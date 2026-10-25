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
  dataEncerramento: string | null;
}

export type VisaoOcorrencia = 'andamento' | 'encerradas';

export interface RegistroHistorico {
  tipo: 'ocorrencia' | 'alerta_gerado' | 'alerta_reconhecido';
  dataHora: string;
  situacaoAnterior: string | null;
  situacaoNova: string | null;
  observacao: string | null;
  autor: string | null;
  orgaoAutor: string | null;
  alerta: { regra: string; dispositivo: string; valorObservado: number; valorLimite: number; operador: string; unidade: string | null } | null;
}

export interface AlertaVinculado {
  id: string;
  regra: string;
  dispositivo: string;
  criticidade: Criticidade;
  situacao: string;
  valorObservado: number;
  unidade: string | null;
  dataHora: string;
}

export interface DetalheOcorrencia extends Ocorrencia {
  responsavel: string | null;
  historico: RegistroHistorico[];
  alertas: AlertaVinculado[];
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
  listar: (visao: VisaoOcorrencia) => api<Ocorrencia[]>(`/ocorrencias?visao=${visao}`),
  detalhe: (id: string) => api<DetalheOcorrencia>(`/ocorrencias/${id}`),
  registrarProvidencia: (id: string, observacao: string, situacao?: 'encerrada') =>
    api<Ocorrencia>(`/ocorrencias/${id}/providencias`, { method: 'POST', body: JSON.stringify({ observacao, situacao }) }),
  categorias: () => api<string[]>('/ocorrencias/categorias'),
  orgaos: () => api<Orgao[]>('/orgaos'),
  registrar: (dados: DadosOcorrencia) => api<Ocorrencia>('/ocorrencias', { method: 'POST', body: JSON.stringify(dados) }),
};

export function tempoEmAberto(abertura: string, fim: number): string {
  const minutos = Math.max(0, Math.floor((fim - new Date(abertura).getTime()) / 60_000));
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 48) return `${horas} h ${String(minutos % 60).padStart(2, '0')} min`;
  return `${Math.floor(horas / 24)} dias`;
}

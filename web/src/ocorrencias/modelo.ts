import type { Criticidade } from '../dispositivos/modelo';
import { api } from '../sessao/api';

export interface Ocorrencia {
  id: string;
  protocolo: string;
  categoria: string;
  descricao: string | null;
  criticidade: Criticidade;
  situacao: string;
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

export const ocorrenciasApi = {
  abertas: () => api<Ocorrencia[]>('/ocorrencias'),
};

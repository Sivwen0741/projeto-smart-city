import { api } from '../sessao/api';

export interface Indicador {
  chave: 'rios' | 'fluxo' | 'ar' | 'iluminacao' | 'ruido' | 'vagas';
  nome: string;
  valor: number | null;
  unidade: string;
  casas: number;
  variacao: string | null;
  proporcao: number | null;
  nota: string;
  estado: 'grave' | 'atencao' | 'estavel' | 'sem_dados';
}

export interface DadosPainel {
  indicadores: Indicador[];
  ocorrenciasHoje: { hora: number; hoje: number | null; media: number }[];
  ocorrenciasPorBairro: { bairro: string; total: number }[];
}

export const painelApi = {
  consultar: () => api<DadosPainel>('/painel'),
};

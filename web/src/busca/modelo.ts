import type { Criticidade, Situacao } from '../dispositivos/modelo';
import { api } from '../sessao/api';

export const MINIMO_CARACTERES = 3;

export interface OcorrenciaEncontrada {
  id: string;
  protocolo: string;
  categoria: string;
  criticidade: Criticidade;
  situacao: string;
  endereco: string | null;
  bairro: string | null;
}

export interface DispositivoEncontrado {
  id: string;
  identificador: string;
  tipo: string;
  situacao: Situacao;
  endereco: string | null;
  bairro: string | null;
  distrito: string | null;
}

export interface ResultadoBusca {
  ocorrencias: OcorrenciaEncontrada[];
  dispositivos: DispositivoEncontrado[];
}

export const buscaApi = {
  buscar: (texto: string, sinal?: AbortSignal) => api<ResultadoBusca>(`/busca?q=${encodeURIComponent(texto)}`, { signal: sinal }),
};

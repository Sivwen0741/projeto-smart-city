import { api } from '../sessao/api';
import type { Criticidade, Situacao } from '../dispositivos/modelo';

export interface PontoSerie {
  dataHora: string;
  valor: number;
}

export interface DiaVazao {
  data: string;
  valor: number;
}

export interface PontoRio {
  dispositivoId: string;
  identificador: string;
  nome: string;
  complemento: string | null;
  bairro: string | null;
  situacao: Situacao;
  simulado: boolean;
  alertaAtivo: Criticidade | null;
  nivel: PontoSerie | null;
  tendencia: number | null;
  serieNivel: PontoSerie[];
  vazao: DiaVazao | null;
  serieVazao: DiaVazao[];
  previsao: DiaVazao[];
}

export interface Rios {
  cota: { valor: number; operador: string; regra: string } | null;
  coleta: { ultimaColeta: string | null; ultimaTentativa: string | null; erro: string | null };
  pontos: PontoRio[];
}

export const riosApi = {
  consultar: () => api<Rios>('/rios'),
};

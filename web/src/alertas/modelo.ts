import type { Criticidade } from '../dispositivos/modelo';
import { api } from '../sessao/api';

export type SituacaoAlerta = 'aberto' | 'em_atendimento' | 'encerrado';
export type Visao = 'ativos' | 'em_atendimento' | 'encerrados_hoje';

export interface Alerta {
  id: string;
  regraId: string;
  regra: string;
  tipoGrandeza: string;
  unidade: string | null;
  dispositivoId: string | null;
  dispositivo: string;
  tipoDispositivo: string;
  endereco: string | null;
  bairro: string | null;
  latitude: number;
  longitude: number;
  valorObservado: number | null;
  operador: string;
  valorLimite: number;
  criticidade: Criticidade;
  situacao: SituacaoAlerta;
  dataHora: string;
  dataReconhecimento: string | null;
  reconhecidoPor: string | null;
  providencia: string | null;
  dataEncerramento: string | null;
  orgao: string | null;
  ocorrenciaId: string | null;
  simulado: boolean;
  composicao: Composicao | null;
  bairroId: string | null;
  fonte: string | null;
  orgaoSugeridoId: string | null;
}

// us10: a segunda leitura do alerta de risco de enchente
export interface Composicao {
  nivel: { dispositivo: string; valor: number; limite: number; dataHora: string };
  complemento: { grandeza: 'precipitacao' | 'vazao_prevista'; valor: number; limite: number; dispositivo: string; dataHora?: string; data?: string };
}

export function textoComposicao(c: Composicao): string {
  const { grandeza, valor, limite, dispositivo, data } = c.complemento;
  const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  if (grandeza === 'precipitacao') return `com chuva de ${numero.format(valor)} mm em ${dispositivo} (limite ${numero.format(limite)} mm)`;
  const dia = data ? ` para ${data.slice(8, 10)}/${data.slice(5, 7)}` : '';
  return `com vazão prevista de ${numero.format(valor)} m³/s${dia} (limite ${numero.format(limite)} m³/s)`;
}

export interface ResumoAlertas {
  ativos: number;
  gravesSemReconhecimento: number;
  emAtendimento: number;
  encerradosHoje: number;
  tempoMedioReconhecimentoMinutos: number | null;
  ultimas24h: number;
  encerradosUltimas24h: number;
  graveMaisAntigo: Alerta | null;
  semComunicacao: number;
  semComunicacaoPorTipo: { tipo: string; quantidade: number }[];
}

export const GRAVIDADES: Record<Criticidade, string> = { grave: 'Grave', atencao: 'Atenção', informativo: 'Informativo' };

export const SITUACOES_ALERTA: Record<SituacaoAlerta, string> = {
  aberto: 'Aberto',
  em_atendimento: 'Em atendimento',
  encerrado: 'Encerrado',
};

const casasDe = (valor: number) => Math.min(2, (String(valor).split('.')[1] ?? '').length);

// tempo sem comunicação da us07, que pode passar de dias
function duracao(minutos: number): string {
  const inteiros = Math.round(minutos);
  if (inteiros < 60) return `${inteiros} min`;
  const horas = Math.floor(inteiros / 60);
  if (horas < 48) return `${horas} h ${String(inteiros % 60).padStart(2, '0')} min`;
  return `${new Intl.NumberFormat('pt-BR').format(Math.floor(horas / 24))} dias`;
}

// o limite usa as mesmas casas da medição, como "3,81 m, limite 3,50 m" no protótipo
export const medida = (valor: number, unidade: string | null, casas = casasDe(valor)) =>
  unidade === 'min'
    ? duracao(valor)
    : `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: Math.max(casas, 2) }).format(valor)}${unidade ? ` ${unidade}` : ''}`;

// us07: sem valor é o dispositivo que nunca se comunicou
export const medicao = (valor: number | null, unidade: string | null) => (valor === null ? 'nunca se comunicou' : medida(valor, unidade));

export const limite = (a: Pick<Alerta, 'valorObservado' | 'valorLimite' | 'unidade'>) =>
  medida(a.valorLimite, a.unidade, Math.max(casasDe(a.valorObservado ?? 0), casasDe(a.valorLimite)));

export const fixoAteReconhecer = (a: Pick<Alerta, 'criticidade' | 'situacao'>) => a.criticidade === 'grave' && a.situacao === 'aberto';

export const lugar = (a: Pick<Alerta, 'endereco' | 'bairro'>) => [a.endereco, a.bairro].filter(Boolean).join(' · ');

export const alertasApi = {
  listar: (visao: Visao = 'ativos') => api<Alerta[]>(`/alertas?visao=${visao}`),
  resumo: () => api<ResumoAlertas>('/alertas/resumo'),
  reconhecer: (id: string, providencia: string) =>
    api<Alerta>(`/alertas/${id}/reconhecimento`, { method: 'POST', body: JSON.stringify({ providencia }) }),
};

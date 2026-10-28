import { Grandeza } from '../dispositivos/modelo';
import { api } from '../sessao/api';

export type Operador = '>' | '>=' | '<' | '<=' | '=' | '<>';
export type Criticidade = 'grave' | 'atencao' | 'informativo';

export interface RegraAlerta {
  id: string;
  nome: string;
  tipoGrandeza: string;
  operador: Operador;
  valorLimite: number;
  duracaoMinutos: number;
  criticidade: Criticidade;
  ativa: boolean;
  alertas: number;
  sistema: boolean;
  tipo: 'simples' | 'risco_enchente';
  limitePrecipitacao: number | null;
  limiteVazaoPrevista: number | null;
  janelaHoras: number | null;
}

export type DadosRegra = Omit<RegraAlerta, 'id' | 'alertas' | 'sistema' | 'tipo' | 'limitePrecipitacao' | 'limiteVazaoPrevista' | 'janelaHoras'> &
  Partial<Pick<RegraAlerta, 'limitePrecipitacao' | 'limiteVazaoPrevista' | 'janelaHoras'>>;

export interface Alteracao {
  acao: string;
  autor: string | null;
  dataHora: string;
  antes: Record<string, unknown> | null;
  depois: Record<string, unknown> | null;
}

export const OPERADORES: { valor: Operador; rotulo: string; descricao: string }[] = [
  { valor: '>', rotulo: '>', descricao: 'maior que' },
  { valor: '>=', rotulo: '≥', descricao: 'maior ou igual a' },
  { valor: '<', rotulo: '<', descricao: 'menor que' },
  { valor: '<=', rotulo: '≤', descricao: 'menor ou igual a' },
  { valor: '=', rotulo: '=', descricao: 'igual a' },
  { valor: '<>', rotulo: '≠', descricao: 'diferente de' },
];

export const CRITICIDADES: { valor: Criticidade; rotulo: string }[] = [
  { valor: 'grave', rotulo: 'Grave' },
  { valor: 'atencao', rotulo: 'Atenção' },
  { valor: 'informativo', rotulo: 'Informativo' },
];

const ROTULOS_CAMPO: Record<string, string> = {
  nome: 'Nome',
  tipoGrandeza: 'Grandeza',
  operador: 'Operador',
  valorLimite: 'Valor limite',
  duracaoMinutos: 'Duração mínima',
  criticidade: 'Gravidade',
  ativa: 'Situação',
  limitePrecipitacao: 'Chuva no bairro',
  limiteVazaoPrevista: 'Vazão prevista',
  janelaHoras: 'Janela',
};

export const regrasApi = {
  listar: () => api<RegraAlerta[]>('/regras-alerta'),
  criar: (dados: DadosRegra) => api<RegraAlerta>('/regras-alerta', { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (id: string, dados: Partial<DadosRegra>) =>
    api<RegraAlerta>(`/regras-alerta/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
  alteracoes: (id: string) => api<Alteracao[]>(`/regras-alerta/${id}/alteracoes`),
};

export const formatarNumero = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 4 });

export function simboloOperador(operador: string): string {
  return OPERADORES.find((o) => o.valor === operador)?.rotulo ?? operador;
}

export function condicao(regra: Pick<RegraAlerta, 'operador' | 'valorLimite' | 'tipoGrandeza'>, grandezas: Grandeza[]): string {
  const unidade = grandezas.find((g) => g.codigo === regra.tipoGrandeza)?.unidade ?? '';
  return `${simboloOperador(regra.operador)} ${formatarNumero(regra.valorLimite)} ${unidade}`.trim();
}

// us10: a condição complementar da regra de risco de enchente
export function condicaoComplementar(regra: Pick<RegraAlerta, 'limitePrecipitacao' | 'limiteVazaoPrevista' | 'janelaHoras'>): string {
  return `e chuva ≥ ${formatarNumero(regra.limitePrecipitacao ?? 0)} mm ou vazão prevista ≥ ${formatarNumero(regra.limiteVazaoPrevista ?? 0)} m³/s em ${regra.janelaHoras} h`;
}

export function descreverValor(campo: string, valor: unknown, grandezas: Grandeza[]): string {
  if (valor === null || valor === undefined) return '–';
  switch (campo) {
    case 'tipoGrandeza':
      return grandezas.find((g) => g.codigo === valor)?.rotulo ?? String(valor);
    case 'operador':
      return simboloOperador(String(valor));
    case 'valorLimite':
      return formatarNumero(Number(valor));
    case 'duracaoMinutos':
      return `${valor} min`;
    case 'criticidade':
      return CRITICIDADES.find((c) => c.valor === valor)?.rotulo ?? String(valor);
    case 'ativa':
      return valor ? 'ativa' : 'desativada';
    case 'limitePrecipitacao':
      return `${formatarNumero(Number(valor))} mm`;
    case 'limiteVazaoPrevista':
      return `${formatarNumero(Number(valor))} m³/s`;
    case 'janelaHoras':
      return `${valor} h`;
    default:
      return String(valor);
  }
}

export function descreverAlteracao(a: Alteracao, grandezas: Grandeza[]): string {
  if (a.acao === 'cadastro_regra_alerta') return 'Regra cadastrada';
  const campos = Object.keys(a.depois ?? {});
  return campos
    .map((c) => `${ROTULOS_CAMPO[c] ?? c} ${descreverValor(c, a.antes?.[c], grandezas)} → ${descreverValor(c, a.depois?.[c], grandezas)}`)
    .join('; ');
}

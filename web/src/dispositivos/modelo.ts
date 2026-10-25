import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { api } from '../sessao/api';

export type Estado = 'ativo' | 'manutencao' | 'inativo';
export type Situacao = 'operando' | 'sem_comunicacao' | 'manutencao' | 'inativo';
export type Ordenacao = 'codigo' | 'tipo' | 'localizacao' | 'situacao' | 'comunicacao';

export interface CampoAtributo {
  nome: string;
  rotulo: string;
  tipo: 'texto' | 'inteiro' | 'grandeza' | 'lista_grandezas';
  obrigatorio: boolean;
  minimo?: number;
  maximo?: number;
  unidade?: string;
}

export interface TipoDispositivo {
  id: string;
  nome: string;
  categoria: string;
  rotuloCategoria: string;
  intervaloLeituraSegundos: number | null;
  campos: CampoAtributo[];
}

export interface Grandeza {
  codigo: string;
  rotulo: string;
  unidade: string;
}

export interface Dispositivo {
  id: string;
  identificador: string;
  tipoDispositivoId: string;
  tipo: string;
  categoria: string;
  descricao: string | null;
  endereco: string | null;
  latitude: number;
  longitude: number;
  bairroId: string | null;
  bairro: string | null;
  distrito: string | null;
  dataInstalacao: string | null;
  estado: Estado;
  situacao: Situacao;
  ultimaComunicacao: string | null;
  limiteComunicacaoSegundos: number;
  atributos: Record<string, unknown>;
  alertaAtivo: Criticidade | null;
  ultimaLeitura: { grandeza: string; valor: number; unidade: string | null; dataHora: string; origem: string } | null;
  simulado: boolean;
}

export type Criticidade = 'grave' | 'atencao' | 'informativo';

export interface Local {
  bairroId: string | null;
  bairro: string | null;
  distrito: string;
}

export type DadosDispositivo = Pick<
  Dispositivo,
  'identificador' | 'tipoDispositivoId' | 'descricao' | 'endereco' | 'latitude' | 'longitude' | 'dataInstalacao' | 'estado' | 'atributos'
>;

export const ESTADOS: { valor: Estado; rotulo: string }[] = [
  { valor: 'ativo', rotulo: 'Ativo' },
  { valor: 'manutencao', rotulo: 'Manutenção' },
  { valor: 'inativo', rotulo: 'Inativo' },
];

export const SITUACOES: Record<Situacao, string> = {
  operando: 'Operando',
  sem_comunicacao: 'Sem comunicação',
  manutencao: 'Em manutenção',
  inativo: 'Inativo',
};

export const dispositivosApi = {
  listar: (ordem: Ordenacao, direcao: 'asc' | 'desc') =>
    api<Dispositivo[]>(`/dispositivos?ordem=${ordem}&direcao=${direcao}`),
  tipos: () => api<TipoDispositivo[]>('/tipos-dispositivo'),
  bairros: () => api<FeatureCollection<Polygon | MultiPolygon, { nome: string; rotulo: [number, number] }>>('/territorio/bairros'),
  grandezas: () => api<Grandeza[]>('/grandezas'),
  localizar: (latitude: number, longitude: number) =>
    api<Local>(`/territorio/localizar?latitude=${latitude}&longitude=${longitude}`),
  criar: (dados: DadosDispositivo) => api<Dispositivo>('/dispositivos', { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (id: string, dados: Partial<DadosDispositivo>) =>
    api<Dispositivo>(`/dispositivos/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
};

export function tempoDesde(instante: string | null, agora: number): string {
  if (!instante) return 'nunca';
  const segundos = Math.max(0, Math.round((agora - new Date(instante).getTime()) / 1000));
  if (segundos < 60) return `há ${segundos} s`;
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 48) return `há ${horas} h`;
  return `há ${Math.floor(horas / 24)} dias`;
}

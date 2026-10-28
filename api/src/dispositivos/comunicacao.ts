import { LIMITE_SEM_INTERVALO_SEGUNDOS } from './dispositivos.service';

export type SituacaoDispositivo = 'operando' | 'sem_comunicacao' | 'manutencao' | 'inativo';

// referência em typescript das expressões LIMITE_COMUNICACAO e SITUACAO, que são as que o banco executa;
// o teste de integração da us22 confere que as duas dão o mesmo resultado
export function limiteComunicacaoSegundos(intervaloDispositivo: number | null, intervaloTipo: number | null): number {
  const intervalo = intervaloDispositivo ?? intervaloTipo;
  return intervalo === null ? LIMITE_SEM_INTERVALO_SEGUNDOS : 2 * intervalo;
}

export function situacaoDispositivo(dispositivo: {
  estado: 'ativo' | 'manutencao' | 'inativo';
  ultimaComunicacao: Date | null;
  intervaloDispositivo: number | null;
  intervaloTipo: number | null;
  agora: Date;
}): SituacaoDispositivo {
  if (dispositivo.estado !== 'ativo') return dispositivo.estado;
  if (!dispositivo.ultimaComunicacao) return 'sem_comunicacao';
  const limite = limiteComunicacaoSegundos(dispositivo.intervaloDispositivo, dispositivo.intervaloTipo) * 1000;
  return dispositivo.ultimaComunicacao.getTime() < dispositivo.agora.getTime() - limite ? 'sem_comunicacao' : 'operando';
}

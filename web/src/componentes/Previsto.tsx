import estilos from './Previsto.module.css';

export interface Previsao {
  historia: string;
  sprint: string;
}

export const textoPrevisao = ({ historia, sprint }: Previsao) => `${historia}, ${sprint}`;

export function Previsto({ previsao }: { previsao: Previsao }) {
  return <span className={estilos.previsto}>{previsao.sprint}</span>;
}

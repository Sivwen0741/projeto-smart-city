import estilos from './Barrinha.module.css';

const LARGURA_BARRA = 3;
const PASSO = 5;
const ALTURA = 16;
const MINIMA = 4;

// minigráfico de 05-dispositivos.svg: nove barras de 3 px, de 4 a 16 px entre o menor e o maior valor
export function Barrinha({ serie, rotulo }: { serie: (number | null)[]; rotulo: string }) {
  const valores = serie.filter((v): v is number => v !== null);
  const menor = Math.min(...valores);
  const maior = Math.max(...valores);
  const altura = (v: number) => (maior === menor ? (ALTURA + MINIMA) / 2 : MINIMA + ((v - menor) / (maior - menor)) * (ALTURA - MINIMA));
  return (
    <svg className={estilos.barrinha} viewBox={`0 0 ${serie.length * PASSO - (PASSO - LARGURA_BARRA)} ${ALTURA}`} role="img" aria-label={rotulo}>
      {serie.map((v, i) =>
        v === null ? null : <rect key={i} x={i * PASSO} y={ALTURA - altura(v)} width={LARGURA_BARRA} height={altura(v)} />,
      )}
    </svg>
  );
}

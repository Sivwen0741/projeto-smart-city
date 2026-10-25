import estilos from './GraficoLinha.module.css';

export interface Ponto {
  x: number;
  y: number;
}

interface Props {
  serie: Ponto[];
  // trecho tracejado depois da série, como a previsão de vazão
  continuacao?: Ponto[];
  limite?: { valor: number; rotulo: string } | null;
  xMinimo: number;
  xMaximo: number;
  rotulosX: { x: number; texto: string }[];
  altura?: number;
  casas?: number;
  rotulo: string;
}

const LARGURA = 400;
const ESQUERDA = 32;
const BAIXO = 18;
const TOPO = 6;

export function GraficoLinha({ serie, continuacao = [], limite, xMinimo, xMaximo, rotulosX, altura = 120, casas = 1, rotulo }: Props) {
  const valores = [...serie, ...continuacao].map((p) => p.y);
  if (limite) valores.push(limite.valor);
  const direita = limite ? 8 + limite.rotulo.length * 6 : 8;
  let minimo = valores.length ? Math.min(...valores) : 0;
  let maximo = valores.length ? Math.max(...valores) : 1;
  if (maximo === minimo) {
    minimo -= 1;
    maximo += 1;
  }
  const folga = (maximo - minimo) * 0.1;
  minimo -= folga;
  maximo += folga;
  const x = (v: number) => ESQUERDA + ((v - xMinimo) / (xMaximo - xMinimo || 1)) * (LARGURA - ESQUERDA - direita);
  const y = (v: number) => TOPO + (1 - (v - minimo) / (maximo - minimo)) * (altura - TOPO - BAIXO);
  const linha = (pontos: Ponto[]) => pontos.map((p) => `${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const numero = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  const marcas = [minimo + folga, (minimo + maximo) / 2, maximo - folga];

  return (
    <svg className={estilos.grafico} viewBox={`0 0 ${LARGURA} ${altura}`} role="img" aria-label={rotulo}>
      {marcas.map((m) => (
        <g key={m}>
          <line className={estilos.grade} x1={ESQUERDA} x2={LARGURA - direita} y1={y(m)} y2={y(m)} />
          <text className={estilos.eixo} x={ESQUERDA - 6} y={y(m) + 3} textAnchor="end">
            {numero.format(m)}
          </text>
        </g>
      ))}
      {rotulosX.map((r) => (
        <text key={r.x} className={estilos.eixo} x={x(r.x)} y={altura - 4} textAnchor="middle">
          {r.texto}
        </text>
      ))}
      {limite && (
        <g>
          <line className={estilos.limite} x1={ESQUERDA} x2={LARGURA - direita} y1={y(limite.valor)} y2={y(limite.valor)} />
          <text className={estilos.rotuloLimite} x={LARGURA - direita + 6} y={y(limite.valor) + 3}>
            {limite.rotulo}
          </text>
        </g>
      )}
      {continuacao.length > 0 && serie.length > 0 && (
        <>
          <line className={estilos.divisa} x1={x(serie[serie.length - 1].x)} x2={x(serie[serie.length - 1].x)} y1={TOPO} y2={altura - BAIXO} />
          <polyline className={estilos.previsao} points={linha([serie[serie.length - 1], ...continuacao])} />
        </>
      )}
      {serie.length > 1 && <polyline className={estilos.linha} points={linha(serie)} />}
      {serie.length === 1 && <circle className={estilos.ponto} cx={x(serie[0].x)} cy={y(serie[0].y)} r={2.5} />}
    </svg>
  );
}

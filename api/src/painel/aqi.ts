// índice de qualidade do ar dos eua para pm2.5 (tabela da epa revisada em 2024), o mesmo "aqi" do protótipo
const FAIXAS: [number, number, number, number][] = [
  [0, 9.0, 0, 50],
  [9.1, 35.4, 51, 100],
  [35.5, 55.4, 101, 150],
  [55.5, 125.4, 151, 200],
  [125.5, 225.4, 201, 300],
  [225.5, 325.4, 301, 500],
];

export function aqiDePm25(concentracao: number): number {
  const c = Math.floor(Math.max(0, concentracao) * 10) / 10;
  const faixa = FAIXAS.find(([, alto]) => c <= alto) ?? FAIXAS[FAIXAS.length - 1];
  const [cBaixo, cAlto, iBaixo, iAlto] = faixa;
  return Math.round(((iAlto - iBaixo) / (cAlto - cBaixo)) * (Math.min(c, cAlto) - cBaixo) + iBaixo);
}

export function faixaAqi(aqi: number): 'boa' | 'moderada' | 'insalubre' {
  return aqi <= 50 ? 'boa' : aqi <= 100 ? 'moderada' : 'insalubre';
}

// mp2,5 em média de 24 h, quadro 1 da orientação técnica do mma de jan/2025 (anexo ii da conama 506/2024)
const FAIXAS_PM25 = [
  { nivel: 'N1', nome: 'boa', cIni: 0, cFin: 15, iIni: 0, iFin: 40 },
  { nivel: 'N2', nome: 'moderada', cIni: 16, cFin: 50, iIni: 41, iFin: 80 },
  { nivel: 'N3', nome: 'ruim', cIni: 51, cFin: 75, iIni: 81, iFin: 120 },
  { nivel: 'N4', nome: 'muito ruim', cIni: 76, cFin: 125, iIni: 121, iFin: 200 },
  { nivel: 'N5', nome: 'péssima', cIni: 126, cFin: 300, iIni: 201, iFin: 400 },
] as const;

export type NivelIqar = (typeof FAIXAS_PM25)[number]['nivel'];

// a orientação arredonda a concentração para o inteiro mais próximo, com x,5 indo para o par
function arredondarConcentracao(valor: number): number {
  const piso = Math.floor(valor);
  const resto = valor - piso;
  if (Math.abs(resto - 0.5) < 1e-9) return piso % 2 === 0 ? piso : piso + 1;
  return Math.round(valor);
}

// acima de 300 µg/m³ a orientação não define faixa; fica no teto da péssima
export function iqarDePm25(concentracao: number): number {
  const c = Math.min(arredondarConcentracao(Math.max(0, concentracao)), FAIXAS_PM25[FAIXAS_PM25.length - 1].cFin);
  const { cIni, cFin, iIni, iFin } = FAIXAS_PM25.find((f) => c <= f.cFin)!;
  return Math.round(iIni + ((iFin - iIni) / (cFin - cIni)) * (c - cIni));
}

export function classificarIqar(indice: number): { nivel: NivelIqar; nome: string } {
  const { nivel, nome } = FAIXAS_PM25.find((f) => indice <= f.iFin) ?? FAIXAS_PM25[FAIXAS_PM25.length - 1];
  return { nivel, nome };
}

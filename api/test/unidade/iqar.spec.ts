import { classificarIqar, iqarDePm25 } from '../../src/qualidade-ar/iqar';

describe('IQAr do PM2.5 (CONAMA 506/2024, orientação técnica do MMA de jan/2025)', () => {
  it.each([
    [0, 0],
    [15, 40],
    [16, 41],
    [50, 80],
    [51, 81],
    [75, 120],
    [76, 121],
    [125, 200],
    [126, 201],
    [300, 400],
  ])('US12-1 valor limite: %d µg/m³ dá índice %d', (concentracao, indice) => {
    expect(iqarDePm25(concentracao)).toBe(indice);
  });

  it('US12-1 a equação interpola dentro da faixa', () => {
    expect(iqarDePm25(33)).toBe(Math.round(41 + ((80 - 41) / (50 - 16)) * (33 - 16)));
    expect(iqarDePm25(100)).toBe(Math.round(121 + ((200 - 121) / (125 - 76)) * (100 - 76)));
  });

  it('US12-1 a concentração é arredondada antes, e x,5 vai para o par', () => {
    expect([iqarDePm25(15.4), iqarDePm25(15.5), iqarDePm25(16.5), iqarDePm25(16.6)]).toEqual([40, 41, 41, iqarDePm25(17)]);
  });

  it('US12-1 partições inválidas: negativa vale zero e acima de 300 fica no teto de 400', () => {
    expect(iqarDePm25(-3)).toBe(0);
    expect(iqarDePm25(301)).toBe(400);
    expect(iqarDePm25(10_000)).toBe(400);
  });

  it.each([
    [0, 'N1', 'boa'],
    [40, 'N1', 'boa'],
    [41, 'N2', 'moderada'],
    [80, 'N2', 'moderada'],
    [81, 'N3', 'ruim'],
    [120, 'N3', 'ruim'],
    [121, 'N4', 'muito ruim'],
    [200, 'N4', 'muito ruim'],
    [201, 'N5', 'péssima'],
    [400, 'N5', 'péssima'],
    [999, 'N5', 'péssima'],
  ])('US12-1 valor limite: índice %d é %s, %s', (indice, nivel, nome) => {
    expect(classificarIqar(indice)).toEqual({ nivel, nome });
  });
});

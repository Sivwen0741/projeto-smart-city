import { compararTexto } from '../../src/ordem-texto';

describe('ordem alfabética em português (INC-007)', () => {
  const ordenar = (nomes: string[]) => [...nomes].sort(compararTexto);

  it('põe as palavras acentuadas no lugar alfabético, não no fim', () => {
    expect(ordenar(['Controlador de iluminação', 'Câmera', 'Estação ambiental'])).toEqual(['Câmera', 'Controlador de iluminação', 'Estação ambiental']);
    expect(ordenar(['Uvaranas', 'Órfãs', 'Olarias', 'Ronda'])).toEqual(['Olarias', 'Órfãs', 'Ronda', 'Uvaranas']);
  });

  it('não diferencia maiúsculas e compara números pelo valor', () => {
    expect(compararTexto('centro', 'Centro')).toBe(0);
    expect(ordenar(['Piriquitos 10', 'Piriquitos 9'])).toEqual(['Piriquitos 9', 'Piriquitos 10']);
  });

  it('trata ausente como texto vazio, antes de qualquer nome', () => {
    expect(compararTexto(null, 'Centro')).toBeLessThan(0);
    expect(compararTexto(undefined, null)).toBe(0);
  });
});

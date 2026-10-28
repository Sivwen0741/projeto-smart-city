import { foraDoLimite } from '../../src/alertas/regra';

describe('avaliação do operador da regra de alerta', () => {
  it.each([
    ['>', 3.49, false],
    ['>', 3.5, false],
    ['>', 3.51, true],
    ['>=', 3.49, false],
    ['>=', 3.5, true],
    ['<', 3.49, true],
    ['<', 3.5, false],
    ['<=', 3.5, true],
    ['<=', 3.51, false],
    ['=', 3.5, true],
    ['=', 3.51, false],
    ['<>', 3.5, false],
    ['<>', 3.51, true],
  ])('US23-1 valor limite: leitura %s 3,5 com %d dá %s', (operador, valor, esperado) => {
    expect(foraDoLimite(valor as number, operador as string, 3.5)).toBe(esperado);
  });

  it('US23-2 limite negativo e zero', () => {
    expect(foraDoLimite(-1, '<', 0)).toBe(true);
    expect(foraDoLimite(0, '<', 0)).toBe(false);
    expect(foraDoLimite(-5, '>', -10)).toBe(true);
  });

  it('US23-1 operador desconhecido nunca dispara', () => {
    expect(foraDoLimite(100, '!=', 0)).toBe(false);
  });
});

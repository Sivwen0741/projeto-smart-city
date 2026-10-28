export function foraDoLimite(valor: number, operador: string, limite: number): boolean {
  switch (operador) {
    case '>':
      return valor > limite;
    case '>=':
      return valor >= limite;
    case '<':
      return valor < limite;
    case '<=':
      return valor <= limite;
    case '=':
      return valor === limite;
    case '<>':
      return valor !== limite;
    default:
      return false;
  }
}

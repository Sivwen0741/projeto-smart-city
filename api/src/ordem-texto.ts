// a collation do postgres da imagem alpine compara bytes e manda os acentos para o fim (inc-007)
export function compararTexto(a: string | null | undefined, b: string | null | undefined): number {
  return (a ?? '').localeCompare(b ?? '', 'pt-BR', { sensitivity: 'base', numeric: true });
}

export class ErroApi extends Error {
  constructor(
    readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

let tokenAtual: string | null = null;
let aoExpirar: (() => void) | null = null;

export function definirToken(token: string | null, expirou?: () => void) {
  tokenAtual = token;
  aoExpirar = expirou ?? null;
}

export async function api<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const cabecalhos = new Headers(opcoes.headers);
  if (opcoes.body) cabecalhos.set('Content-Type', 'application/json');
  if (tokenAtual) cabecalhos.set('Authorization', `Bearer ${tokenAtual}`);

  const resposta = await fetch(`/api${caminho}`, { ...opcoes, headers: cabecalhos });
  const corpo = resposta.status === 204 ? null : await resposta.json().catch(() => null);

  if (!resposta.ok) {
    if (resposta.status === 401 && tokenAtual) aoExpirar?.();
    const mensagem = Array.isArray(corpo?.message) ? corpo.message[0] : corpo?.message;
    throw new ErroApi(resposta.status, mensagem ?? 'Não foi possível falar com o servidor. Tente de novo.');
  }
  return corpo as T;
}

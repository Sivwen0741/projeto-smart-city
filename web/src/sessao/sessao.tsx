import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, definirToken } from './api';

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  orgao: string;
  orgaoId: string;
  permissoes: Permissao[];
}

export type Permissao = 'consultar' | 'operar' | 'configurar' | 'administrar';

interface Sessao {
  token: string;
  expiraEm: string;
  usuario: UsuarioSessao;
}

interface ContextoSessao {
  usuario: UsuarioSessao | null;
  token: string | null;
  entrar(email: string, senha: string, manterConectado: boolean): Promise<void>;
  sair(): void;
  pode(permissao: Permissao): boolean;
}

const CHAVE = 'scoc.sessao';
const Contexto = createContext<ContextoSessao | null>(null);

function lerGuardada(): Sessao | null {
  for (const armazenamento of [localStorage, sessionStorage]) {
    try {
      const sessao = JSON.parse(armazenamento.getItem(CHAVE) ?? 'null') as Sessao | null;
      if (sessao && new Date(sessao.expiraEm).getTime() > Date.now()) return sessao;
      armazenamento.removeItem(CHAVE);
    } catch {}
  }
  return null;
}

function apagarGuardada() {
  for (const armazenamento of [localStorage, sessionStorage]) {
    try {
      armazenamento.removeItem(CHAVE);
    } catch {}
  }
}

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(lerGuardada);

  const sair = useCallback(() => {
    apagarGuardada();
    setSessao(null);
  }, []);

  definirToken(sessao?.token ?? null, sair);

  useEffect(() => {
    if (!sessao) return;
    const restante = new Date(sessao.expiraEm).getTime() - Date.now();
    const temporizador = setTimeout(sair, Math.max(restante, 0));
    return () => clearTimeout(temporizador);
  }, [sessao, sair]);

  // o perfil pode ter mudado depois do login, e sessões anteriores à us21 não traziam permissões
  const token = sessao?.token;
  useEffect(() => {
    if (!token) return;
    api<UsuarioSessao>('/auth/eu')
      .then((usuario) => setSessao((atual) => (atual && atual.token === token ? { ...atual, usuario } : atual)))
      .catch(() => undefined);
  }, [token]);

  const entrar = useCallback(async (email: string, senha: string, manterConectado: boolean) => {
    const nova = await api<Sessao>('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
    apagarGuardada();
    try {
      (manterConectado ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(nova));
    } catch {}
    setSessao(nova);
  }, []);

  const valor = useMemo(
    () => ({
      usuario: sessao?.usuario ?? null,
      token: sessao?.token ?? null,
      entrar,
      sair,
      pode: (permissao: Permissao) => sessao?.usuario.permissoes?.includes(permissao) ?? false,
    }),
    [sessao, entrar, sair],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessao(): ContextoSessao {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useSessao fora de ProvedorSessao');
  return contexto;
}

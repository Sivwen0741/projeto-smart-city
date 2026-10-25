import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Alerta } from '../alertas/modelo';
import { useSessao } from '../sessao/sessao';

type Ouvinte = (alerta: Alerta | null) => void;

interface ContextoTempoReal {
  conectado: boolean;
  ouvir(ouvinte: Ouvinte): () => void;
  ouvirEvento(evento: string, ouvinte: (dados: unknown) => void): () => void;
}

const Contexto = createContext<ContextoTempoReal | null>(null);

// cada (re)conexão também avisa os ouvintes com nulo: a tela consulta de novo e recupera o que perdeu
export function ProvedorTempoReal({ children }: { children: ReactNode }) {
  const { token } = useSessao();
  const ouvintes = useRef(new Set<Ouvinte>());
  // eventos frequentes (leituras) só chegam a quem pediu, para não recarregar todas as telas
  const porEvento = useRef(new Map<string, Set<(dados: unknown) => void>>());
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    if (!token) return;
    const socket: Socket = io({ path: '/api/tempo-real', auth: { token } });
    const avisar = (alerta: Alerta | null) => ouvintes.current.forEach((o) => o(alerta));
    socket.on('connect', () => {
      setConectado(true);
      avisar(null);
    });
    socket.on('disconnect', () => setConectado(false));
    socket.on('alerta:novo', avisar);
    socket.on('alerta:atualizado', avisar);
    socket.on('ocorrencia:nova', () => avisar(null));
    socket.on('ocorrencia:atualizada', () => avisar(null));
    socket.onAny((evento: string, dados: unknown) => porEvento.current.get(evento)?.forEach((o) => o(dados)));
    return () => {
      socket.disconnect();
      setConectado(false);
    };
  }, [token]);

  const valor = useRef<ContextoTempoReal>({
    conectado: false,
    ouvir(ouvinte) {
      ouvintes.current.add(ouvinte);
      return () => ouvintes.current.delete(ouvinte);
    },
    ouvirEvento(evento, ouvinte) {
      const conjunto = porEvento.current.get(evento) ?? new Set();
      conjunto.add(ouvinte);
      porEvento.current.set(evento, conjunto);
      return () => conjunto.delete(ouvinte);
    },
  });
  valor.current = { ...valor.current, conectado };

  return <Contexto.Provider value={valor.current}>{children}</Contexto.Provider>;
}

export function useAlertasAoVivo(aoMudar: Ouvinte): boolean {
  const contexto = useContext(Contexto);
  const atual = useRef(aoMudar);
  atual.current = aoMudar;
  useEffect(() => contexto?.ouvir((a) => atual.current(a)), [contexto]);
  return contexto?.conectado ?? false;
}

export function useEventoAoVivo(evento: string, aoReceber: (dados: unknown) => void): void {
  const contexto = useContext(Contexto);
  const atual = useRef(aoReceber);
  atual.current = aoReceber;
  useEffect(() => contexto?.ouvirEvento(evento, (d) => atual.current(d)), [contexto, evento]);
}

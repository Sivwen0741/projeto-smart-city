import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { Alerta } from '../alertas/modelo';

interface ContextoRegistro {
  aberto: boolean;
  alerta: Alerta | null;
  abrir(alerta?: Alerta): void;
  fechar(): void;
}

const Contexto = createContext<ContextoRegistro | null>(null);

// o formulário da us05 abre pelo menu, em qualquer tela, ou pelo painel de reconhecimento com o alerta
export function ProvedorRegistroOcorrencia({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<{ aberto: boolean; alerta: Alerta | null }>({ aberto: false, alerta: null });
  const abrir = useCallback((alerta?: Alerta) => setEstado({ aberto: true, alerta: alerta ?? null }), []);
  const fechar = useCallback(() => setEstado({ aberto: false, alerta: null }), []);
  const valor = useMemo(() => ({ ...estado, abrir, fechar }), [estado, abrir, fechar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useRegistroOcorrencia(): ContextoRegistro {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useRegistroOcorrencia fora de ProvedorRegistroOcorrencia');
  return contexto;
}

import { ReactNode } from 'react';
import estilos from './Aviso.module.css';

export function Aviso({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className={estilos.aviso}>
      {children}
    </p>
  );
}

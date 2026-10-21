import { InputHTMLAttributes, useId } from 'react';
import estilos from './Campo.module.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string;
  erro?: string;
  grande?: boolean;
}

export function Campo({ rotulo, erro, grande, className, ...resto }: Props) {
  const id = useId();
  return (
    <div className={[estilos.campo, className].filter(Boolean).join(' ')}>
      <label className={estilos.rotulo} htmlFor={id}>
        {rotulo}
      </label>
      <input
        id={id}
        className={[estilos.entrada, grande && estilos.grande].filter(Boolean).join(' ')}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
        {...resto}
      />
      {erro && (
        <span id={`${id}-erro`} className={estilos.erro}>
          {erro}
        </span>
      )}
    </div>
  );
}

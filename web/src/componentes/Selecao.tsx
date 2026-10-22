import { SelectHTMLAttributes, useId } from 'react';
import estilos from './Campo.module.css';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  rotulo: string;
  erro?: string;
  opcoes: { valor: string; rotulo: string }[];
  vazio?: string;
}

export function Selecao({ rotulo, erro, opcoes, vazio, className, ...resto }: Props) {
  const id = useId();
  return (
    <div className={[estilos.campo, className].filter(Boolean).join(' ')}>
      <label className={estilos.rotulo} htmlFor={id}>
        {rotulo}
      </label>
      <select
        id={id}
        className={`${estilos.entrada} ${estilos.selecao}`}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
        {...resto}
      >
        {vazio !== undefined && <option value="">{vazio}</option>}
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      {erro && (
        <span id={`${id}-erro`} className={estilos.erro}>
          {erro}
        </span>
      )}
    </div>
  );
}

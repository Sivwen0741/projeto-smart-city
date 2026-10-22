import { useId } from 'react';
import estilos from './Segmentado.module.css';

interface Props<T extends string> {
  rotulo: string;
  opcoes: { valor: T; rotulo: string; descricao?: string; classe?: string }[];
  valor: T | null;
  aoMudar: (valor: T) => void;
  erro?: string;
}

export function Segmentado<T extends string>({ rotulo, opcoes, valor, aoMudar, erro }: Props<T>) {
  const id = useId();
  return (
    <fieldset className={estilos.grupo} aria-describedby={erro ? `${id}-erro` : undefined}>
      <legend className={estilos.rotulo}>{rotulo}</legend>
      <div
        className={estilos.opcoes}
        style={{ gridTemplateColumns: `repeat(${opcoes.length}, minmax(0, 1fr))` }}
        aria-invalid={erro ? true : undefined}
      >
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            className={[estilos.opcao, o.classe].filter(Boolean).join(' ')}
            aria-pressed={o.valor === valor}
            aria-label={o.descricao}
            title={o.descricao}
            onClick={() => aoMudar(o.valor)}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
      {erro && (
        <span id={`${id}-erro`} className={estilos.erro}>
          {erro}
        </span>
      )}
    </fieldset>
  );
}

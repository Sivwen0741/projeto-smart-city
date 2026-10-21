import estilos from './Marca.module.css';

export function Marca({ grande }: { grande?: boolean }) {
  return (
    <span className={[estilos.marca, grande && estilos.grande].filter(Boolean).join(' ')} aria-hidden="true">
      PG
    </span>
  );
}

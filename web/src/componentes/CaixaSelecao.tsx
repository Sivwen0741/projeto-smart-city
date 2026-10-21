import { InputHTMLAttributes } from 'react';
import estilos from './CaixaSelecao.module.css';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  rotulo: string;
}

export function CaixaSelecao({ rotulo, className, ...resto }: Props) {
  return (
    <label className={[estilos.caixa, className].filter(Boolean).join(' ')}>
      <input type="checkbox" {...resto} />
      {rotulo}
    </label>
  );
}

import { ButtonHTMLAttributes } from 'react';
import estilos from './Botao.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'perigo' | 'link';
  grande?: boolean;
  largo?: boolean;
}

export function Botao({ variante = 'secundario', grande, largo, className, type = 'button', ...resto }: Props) {
  const classes = [estilos.botao, estilos[variante], grande && estilos.grande, largo && estilos.largo, className];
  return <button type={type} className={classes.filter(Boolean).join(' ')} {...resto} />;
}

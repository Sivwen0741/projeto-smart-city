import estilos from './Simulado.module.css';

export const TITULO_SIMULADO = 'Dado do simulador da equipe, não de um sensor instalado';

export function Simulado() {
  return (
    <span className={estilos.simulado} title={TITULO_SIMULADO}>
      simulado
    </span>
  );
}

import { MapaCidade } from '../componentes/MapaCidade';
import estilos from './Mapa.module.css';

export function Mapa() {
  return (
    <div className={estilos.mapa}>
      <MapaCidade cheia />
    </div>
  );
}

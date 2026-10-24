import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import estilos from './MapaPonto.module.css';

const CENTRO_PONTA_GROSSA: L.LatLngTuple = [-25.0945, -50.1633];

interface Props {
  ponto: { latitude: number; longitude: number } | null;
  aoEscolher: (latitude: number, longitude: number) => void;
  rotulo: string;
}

const arredondar = (valor: number) => Math.round(valor * 1e6) / 1e6;

export function MapaPonto({ ponto, aoEscolher, rotulo }: Props) {
  const elemento = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const marcador = useRef<L.Marker | null>(null);
  const escolher = useRef(aoEscolher);
  escolher.current = aoEscolher;

  useEffect(() => {
    const m = L.map(elemento.current!, { zoomControl: true, attributionControl: true }).setView(CENTRO_PONTA_GROSSA, 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    m.attributionControl.setPrefix(false);
    m.on('click', (e: L.LeafletMouseEvent) => escolher.current(arredondar(e.latlng.lat), arredondar(e.latlng.lng)));
    mapa.current = m;
    return () => {
      m.remove();
      mapa.current = null;
      marcador.current = null;
    };
  }, []);

  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    if (!ponto) {
      marcador.current?.remove();
      marcador.current = null;
      return;
    }
    const posicao: L.LatLngTuple = [ponto.latitude, ponto.longitude];
    if (marcador.current) marcador.current.setLatLng(posicao);
    else {
      marcador.current = L.marker(posicao, {
        icon: L.divIcon({ className: estilos.marcador, iconSize: undefined }),
        keyboard: false,
        interactive: false,
      }).addTo(m);
    }
    if (!m.getBounds().pad(-0.1).contains(posicao)) m.setView(posicao, Math.max(m.getZoom(), 15));
  }, [ponto?.latitude, ponto?.longitude]);

  return <div ref={elemento} className={estilos.mapa} role="application" aria-label={rotulo} />;
}

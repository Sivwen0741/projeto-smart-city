import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dispositivo, dispositivosApi, SITUACOES, tempoDesde } from '../dispositivos/modelo';
import { Ocorrencia, ocorrenciasApi, SITUACOES_OCORRENCIA } from '../ocorrencias/modelo';
import estilos from './MapaCidade.module.css';
import { Previsao, Previsto, textoPrevisao } from './Previsto';

const CENTRO_PONTA_GROSSA: L.LatLngTuple = [-25.0945, -50.1633];
const ATUALIZACAO_MS = 15_000;
const FILTRAR: Previsao = { historia: 'US08', sprint: 'backlog' };
const CAMADAS: Previsao = { historia: 'US27', sprint: 'sprint 6' };

type Classe = 'grave' | 'atencao' | 'normal' | 'parado';

const LEGENDA: { classe: Classe; rotulo: string }[] = [
  { classe: 'grave', rotulo: 'Grave' },
  { classe: 'atencao', rotulo: 'Atenção' },
  { classe: 'normal', rotulo: 'Normal' },
  { classe: 'parado', rotulo: 'Sem comunicação ou manutenção' },
];

const GRAVIDADES: Record<string, string> = { grave: 'Grave', atencao: 'Atenção', informativo: 'Informativo' };

// alerta informativo não muda a cor: a legenda do protótipo só destaca grave e atenção
function classe(d: Dispositivo): Classe {
  if (d.alertaAtivo === 'grave' || d.alertaAtivo === 'atencao') return d.alertaAtivo;
  return d.situacao === 'operando' ? 'normal' : 'parado';
}

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

const escapar = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function resumoDispositivo(d: Dispositivo, agora: number): string {
  const lugar = [d.endereco, d.bairro ?? (d.distrito ? `zona rural, ${d.distrito}` : null)].filter(Boolean).join(', ');
  // câmera e semáforo só mandam sinal de vida
  const leitura = d.ultimaLeitura ? `${numero.format(d.ultimaLeitura.valor)} ${d.ultimaLeitura.unidade ?? ''}`.trim() : null;
  const situacao = d.alertaAtivo ? `Alerta ${GRAVIDADES[d.alertaAtivo].toLowerCase()}` : SITUACOES[d.situacao];
  return `<strong>${escapar(d.identificador)} · ${escapar(d.tipo.toLowerCase())}</strong>
    <span>${escapar([lugar, leitura].filter(Boolean).join(' · '))}</span>
    <span>${escapar(situacao)} · comunicação ${escapar(tempoDesde(d.ultimaComunicacao, agora))}</span>`;
}

function resumoOcorrencia(o: Ocorrencia): string {
  return `<strong>Ocorrência ${escapar(o.protocolo)}</strong>
    <span>${escapar(o.categoria)}${o.bairro ? ` · ${escapar(o.bairro)}` : ''}</span>
    <span>${escapar(GRAVIDADES[o.criticidade] ?? o.criticidade)} · ${escapar(SITUACOES_OCORRENCIA[o.situacao] ?? o.situacao)}</span>`;
}

interface Props {
  cheia?: boolean;
}

export function MapaCidade({ cheia = false }: Props) {
  const elemento = useRef<HTMLDivElement>(null);
  const camadas = useRef<{ mapa: L.Map; agrupados: L.MarkerClusterGroup; destacados: L.LayerGroup; ocorrencias: L.LayerGroup } | null>(null);
  const marcadores = useRef(new Map<string, { marcador: L.Marker; classe: Classe }>());
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [atualizado, setAtualizado] = useState<number | null>(null);
  const [agora, setAgora] = useState(() => Date.now());
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const mapa = L.map(elemento.current!, { zoomControl: true, attributionControl: true }).setView(CENTRO_PONTA_GROSSA, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: estilos.base,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa);
    mapa.attributionControl.setPrefix(false);
    // grave e atenção ficam fora do agrupamento para nunca sumirem dentro de um número
    const agrupados = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 36,
      iconCreateFunction: (grupo) =>
        L.divIcon({ html: `<span>${grupo.getChildCount()}</span>`, className: estilos.grupo, iconSize: undefined }),
    }).addTo(mapa);
    const destacados = L.layerGroup().addTo(mapa);
    const ocorrencias = L.layerGroup().addTo(mapa);
    camadas.current = { mapa, agrupados, destacados, ocorrencias };

    dispositivosApi
      .bairros()
      .then((colecao) => {
        L.geoJSON(colecao, { interactive: false, style: { className: estilos.bairro } }).addTo(mapa).bringToBack();
        for (const f of colecao.features) {
          const [longitude, latitude] = f.properties.rotulo;
          L.marker([latitude, longitude], {
            interactive: false,
            keyboard: false,
            icon: L.divIcon({ html: escapar(f.properties.nome), className: estilos.nomeBairro, iconSize: undefined }),
          }).addTo(mapa);
        }
      })
      .catch(() => setErro(true));

    return () => {
      mapa.remove();
      camadas.current = null;
      marcadores.current.clear();
    };
  }, []);

  useEffect(() => {
    let ativo = true;
    const carregar = () =>
      Promise.all([dispositivosApi.listar('codigo', 'asc'), ocorrenciasApi.abertas()])
        .then(([d, o]) => {
          if (!ativo) return;
          setDispositivos(d.filter((x) => x.estado !== 'inativo'));
          setOcorrencias(o.filter((x) => x.latitude !== null && x.longitude !== null));
          setAtualizado(Date.now());
          setErro(false);
        })
        .catch(() => ativo && setErro(true));
    carregar();
    const intervalo = setInterval(carregar, ATUALIZACAO_MS);
    const relogio = setInterval(() => setAgora(Date.now()), 1000);
    return () => {
      ativo = false;
      clearInterval(intervalo);
      clearInterval(relogio);
    };
  }, []);

  useEffect(() => {
    const c = camadas.current;
    if (!c) return;
    const presentes = new Set<string>();
    for (const d of dispositivos) {
      presentes.add(d.id);
      const nova = classe(d);
      const destacado = nova === 'grave' || nova === 'atencao';
      const existente = marcadores.current.get(d.id);
      const icone = L.divIcon({ className: `${estilos.marcador} ${estilos[nova]}`, iconSize: undefined });
      if (existente) {
        existente.marcador.setLatLng([d.latitude, d.longitude]);
        existente.marcador.setPopupContent(resumoDispositivo(d, Date.now()));
        if (existente.classe !== nova) {
          const eraDestacado = existente.classe === 'grave' || existente.classe === 'atencao';
          existente.marcador.setIcon(icone);
          if (eraDestacado !== destacado) {
            (eraDestacado ? c.destacados : c.agrupados).removeLayer(existente.marcador);
            (destacado ? c.destacados : c.agrupados).addLayer(existente.marcador);
          }
          existente.classe = nova;
        }
        continue;
      }
      const marcador = L.marker([d.latitude, d.longitude], { icon: icone, title: `${d.identificador}, ${d.tipo}`, zIndexOffset: destacado ? 1000 : 0 });
      marcador.bindPopup(resumoDispositivo(d, Date.now()), { className: estilos.chamada, closeButton: false, offset: [0, -4] });
      (destacado ? c.destacados : c.agrupados).addLayer(marcador);
      marcadores.current.set(d.id, { marcador, classe: nova });
    }
    for (const [id, { marcador }] of marcadores.current) {
      if (presentes.has(id)) continue;
      c.agrupados.removeLayer(marcador);
      c.destacados.removeLayer(marcador);
      marcadores.current.delete(id);
    }
  }, [dispositivos]);

  useEffect(() => {
    const c = camadas.current;
    if (!c) return;
    c.ocorrencias.clearLayers();
    for (const o of ocorrencias) {
      L.marker([o.latitude!, o.longitude!], {
        icon: L.divIcon({ className: `${estilos.ocorrencia} ${estilos[o.criticidade] ?? ''}`, iconSize: undefined }),
        title: `Ocorrência ${o.protocolo}`,
        zIndexOffset: 2000,
      })
        .bindPopup(resumoOcorrencia(o), { className: estilos.chamada, closeButton: false, offset: [0, -4] })
        .addTo(c.ocorrencias);
    }
  }, [ocorrencias]);

  useEffect(() => {
    camadas.current?.mapa.invalidateSize();
  }, [cheia]);

  const contagem = (alvo: Classe) => dispositivos.filter((d) => classe(d) === alvo).length;
  const segundos = atualizado === null ? null : Math.max(0, Math.round((agora - atualizado) / 1000));

  return (
    <section className={estilos.caixa} aria-label="Mapa da cidade">
      <div className={estilos.barra}>
        <h2 className={estilos.titulo}>Mapa da cidade</h2>
        <span className={estilos.contagem}>
          {erro
            ? 'não foi possível atualizar'
            : segundos === null
              ? 'carregando'
              : `${dispositivos.length} dispositivos${ocorrencias.length ? `, ${ocorrencias.length} ocorrências abertas` : ''}, atualizado há ${segundos} s`}
        </span>
        <div className={estilos.acoes}>
          <span className={estilos.previsto} aria-disabled="true" title={`Previsto: ${textoPrevisao(FILTRAR)}`}>
            Filtrar <Previsto previsao={FILTRAR} />
          </span>
          {cheia ? (
            <Link className={estilos.acao} to="/painel">
              Voltar ao painel
            </Link>
          ) : (
            <Link className={estilos.acao} to="/mapa">
              Tela cheia
            </Link>
          )}
          <span className={`${estilos.previsto} ${estilos.camadas}`} aria-disabled="true" title={`Previsto: ${textoPrevisao(CAMADAS)}`}>
            Camadas <Previsto previsao={CAMADAS} />
          </span>
        </div>
      </div>
      <div ref={elemento} className={estilos.mapa} role="application" aria-label="Mapa de Ponta Grossa com dispositivos e ocorrências" />
      <ul className={estilos.legenda}>
        {LEGENDA.map((l) => (
          <li key={l.classe}>
            <span className={`${estilos.quadro} ${estilos[l.classe]}`} />
            {l.rotulo} · {contagem(l.classe)}
          </li>
        ))}
        <li>
          <span className={estilos.quadroOcorrencia} />
          Ocorrência aberta · {ocorrencias.length}
        </li>
      </ul>
    </section>
  );
}

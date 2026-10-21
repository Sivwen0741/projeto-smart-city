import { writeFileSync } from 'fs';
import { join } from 'path';
const osmtogeojson = require('osmtogeojson');

const MUNICIPIO_IBGE = '4119905';
const IBGE = `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${MUNICIPIO_IBGE}/distritos`;
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
// o overpass recusa requisição sem user-agent (http 406)
const USER_AGENT = 'scoc-unicesumar/0.1 (projeto academico; github.com/Sivwen0741/projeto-smart-city)';
const DESTINO = join(__dirname, '..', 'src', 'database', 'seeds', 'territorio');

interface Feicao {
  type: 'Feature';
  properties: Record<string, string | number>;
  geometry: { type: string; coordinates: unknown };
}

const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

function arredondar(c: unknown): unknown {
  return Array.isArray(c) ? c.map(arredondar) : typeof c === 'number' ? Math.round(c * 1e6) / 1e6 : c;
}

// relação incompleta no osm gera anel aberto; fecha com segmento reto para não barrar a carga
function fecharAneis(nome: string, geometria: Feicao['geometry']): Feicao['geometry'] {
  const poligonos = (geometria.type === 'Polygon' ? [geometria.coordinates] : geometria.coordinates) as number[][][][];
  for (const anel of poligonos.flat()) {
    const [primeiro, ultimo] = [anel[0], anel[anel.length - 1]];
    if (primeiro[0] !== ultimo[0] || primeiro[1] !== ultimo[1]) {
      const metros = Math.round(Math.hypot((primeiro[0] - ultimo[0]) * 101_000, (primeiro[1] - ultimo[1]) * 111_000));
      console.warn(`aviso: ${nome} tem anel aberto no OpenStreetMap (falha de ~${metros} m); fechado com segmento reto`);
      anel.push([...primeiro]);
    }
  }
  return geometria;
}

async function overpass(adminLevel: string): Promise<Feicao[]> {
  const consulta = `[out:json][timeout:120];
    area["IBGE:GEOCODIGO"="${MUNICIPIO_IBGE}"]->.municipio;
    relation(area.municipio)["boundary"="administrative"]["admin_level"="${adminLevel}"];
    out geom;`;
  const falhas: string[] = [];
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    for (const servidor of OVERPASS) {
      const resposta = await fetch(servidor, {
        method: 'POST',
        headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ data: consulta }),
      });
      if (resposta.ok) {
        const geojson = osmtogeojson(await resposta.json());
        return (geojson.features as Feicao[]).filter((f) => /Polygon$/.test(f.geometry.type));
      }
      falhas.push(`${servidor}: ${resposta.status}`);
    }
    await new Promise((r) => setTimeout(r, 10_000));
  }
  throw new Error(`Overpass indisponível: ${falhas.join('; ')}`);
}

function colecao(features: Feicao[], atribuicao: string) {
  return { type: 'FeatureCollection', atribuicao, features };
}

async function principal() {
  const gerado = new Date().toISOString();
  const atribuicaoOsm = `© Colaboradores do OpenStreetMap, ODbL 1.0 (https://www.openstreetmap.org/copyright). Obtido via Overpass em ${gerado}.`;

  const distritosIbge = (await (await fetch(IBGE, { headers: { 'User-Agent': USER_AGENT } })).json()) as {
    id: number;
    nome: string;
  }[];
  const poligonosDistrito = await overpass('9');

  const distritos: Feicao[] = distritosIbge.map((d) => {
    const codigo = String(d.id);
    const poligono =
      poligonosDistrito.find((p) => p.properties['IBGE:GEOCODIGO'] === codigo) ??
      poligonosDistrito.find((p) => normalizar(String(p.properties.name)) === normalizar(d.nome));
    if (!poligono) throw new Error(`Distrito ${d.nome} (${codigo}) sem polígono no OpenStreetMap`);
    return {
      type: 'Feature',
      properties: { nome: d.nome, codigo_ibge: codigo, osm_id: Number(String(poligono.properties.id).split('/')[1]) },
      geometry: fecharAneis(d.nome, { type: poligono.geometry.type, coordinates: arredondar(poligono.geometry.coordinates) }),
    };
  });

  const bairros: Feicao[] = (await overpass('10'))
    .map((b): Feicao => ({
      type: 'Feature',
      properties: { nome: String(b.properties.name), osm_id: Number(String(b.properties.id).split('/')[1]) },
      geometry: fecharAneis(String(b.properties.name), { type: b.geometry.type, coordinates: arredondar(b.geometry.coordinates) }),
    }))
    .sort((a, b) => String(a.properties.nome).localeCompare(String(b.properties.nome), 'pt-BR'));

  writeFileSync(
    join(DESTINO, 'distritos.geojson'),
    JSON.stringify(colecao(distritos, `Lista e códigos: IBGE, API de Localidades (${IBGE}). Polígonos: ${atribuicaoOsm}`)) + '\n',
  );
  writeFileSync(join(DESTINO, 'bairros.geojson'), JSON.stringify(colecao(bairros, `Polígonos: ${atribuicaoOsm}`)) + '\n');
  console.log(`${distritos.length} distritos e ${bairros.length} bairros gravados em ${DESTINO}`);
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});

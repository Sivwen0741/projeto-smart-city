import { readFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';

interface Colecao {
  features: { properties: Record<string, string | number>; geometry: object }[];
}

function ler(arquivo: string): Colecao {
  return JSON.parse(readFileSync(join(__dirname, 'territorio', arquivo), 'utf8'));
}

export async function carregarTerritorio(fonte: DataSource): Promise<void> {
  await fonte.transaction(async (m) => {
    for (const f of ler('distritos.geojson').features) {
      await m.query(
        `INSERT INTO distrito (nome, codigo_ibge, area)
         VALUES ($1, $2, ST_Multi(ST_CollectionExtract(ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)), 3)))
         ON CONFLICT (codigo_ibge) DO UPDATE SET nome = EXCLUDED.nome, area = EXCLUDED.area`,
        [f.properties.nome, f.properties.codigo_ibge, JSON.stringify(f.geometry)],
      );
    }
    for (const f of ler('bairros.geojson').features) {
      await m.query(
        `WITH g AS (SELECT ST_Multi(ST_CollectionExtract(ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)), 3)) AS area)
         INSERT INTO bairro (distrito_id, nome, osm_id, area)
         SELECT d.id, $1, $2, g.area
           FROM g JOIN distrito d ON ST_Contains(d.area, ST_PointOnSurface(g.area))
         ON CONFLICT (osm_id) DO UPDATE
           SET nome = EXCLUDED.nome, area = EXCLUDED.area, distrito_id = EXCLUDED.distrito_id`,
        [f.properties.nome, f.properties.osm_id, JSON.stringify(f.geometry)],
      );
    }
  });
  const [{ distritos, bairros }] = await fonte.query(
    `SELECT (SELECT count(*) FROM distrito)::int AS distritos, (SELECT count(*) FROM bairro)::int AS bairros`,
  );
  console.log(`território carregado: ${distritos} distritos, ${bairros} bairros`);
}

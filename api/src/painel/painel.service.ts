import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BairroOcorrenciasDto, PainelDto, PontoHoraDto } from './dto/painel.dto';
import { calcularIndicadores, GRANDEZAS, Leitura } from './indicadores';

// última leitura de cada dispositivo na última hora, com a de uma hora antes ao lado
const LEITURAS = `
  SELECT DISTINCT ON (l.dispositivo_id, l.tipo_grandeza)
         l.dispositivo_id::text AS "dispositivoId", d.identificador, d.endereco, b.nome AS bairro,
         l.tipo_grandeza AS grandeza, l.valor::float8 AS valor,
         (SELECT a.valor::float8 FROM leitura a
           WHERE a.dispositivo_id = l.dispositivo_id AND a.tipo_grandeza = l.tipo_grandeza AND a.fonte_dados_id IS NULL
             AND a.data_hora <= now() - interval '1 hour' AND a.data_hora > now() - interval '75 minutes'
           ORDER BY a.data_hora DESC LIMIT 1) AS anterior,
         (d.atributos_especificos->>'quantidadePontos')::int AS "quantidadePontos"
    FROM leitura l
    JOIN dispositivo d ON d.id = l.dispositivo_id
    LEFT JOIN bairro b ON b.id = d.bairro_id
   WHERE l.fonte_dados_id IS NULL AND d.estado <> 'inativo'
     AND l.data_hora > now() - interval '1 hour' AND l.tipo_grandeza = ANY($1)
   ORDER BY l.dispositivo_id, l.tipo_grandeza, l.data_hora DESC`;

// o iqar do mp2,5 é sobre a média de 24 h; a anterior é a janela que terminou uma hora antes
const MEDIAS_PM25 = `
  SELECT dispositivo_id::text AS "dispositivoId",
         avg(valor) FILTER (WHERE data_hora > now() - interval '24 hours')::float8 AS atual,
         avg(valor) FILTER (WHERE data_hora <= now() - interval '1 hour')::float8 AS anterior
    FROM leitura
   WHERE fonte_dados_id IS NULL AND tipo_grandeza = 'pm25' AND data_hora > now() - interval '25 hours'
     AND dispositivo_id::text = ANY($1)
   GROUP BY dispositivo_id`;

@Injectable()
export class PainelService {
  constructor(private readonly fonte: DataSource) {}

  async consultar(): Promise<PainelDto> {
    const [leituras, alertas, limites, ocorrenciasHoje, ocorrenciasPorBairro] = await Promise.all([
      this.fonte.query(LEITURAS, [Object.values(GRANDEZAS).flat()]) as Promise<Leitura[]>,
      this.fonte.query(
        `SELECT r.tipo_grandeza AS grandeza,
                (array_agg(a.criticidade ORDER BY array_position(ARRAY['grave', 'atencao', 'informativo'], a.criticidade::text)))[1] AS criticidade
           FROM alerta a JOIN regra_alerta r ON r.id = a.regra_alerta_id
          WHERE a.situacao IN ('aberto', 'em_atendimento')
          GROUP BY r.tipo_grandeza`,
      ) as Promise<{ grandeza: string; criticidade: string }[]>,
      this.fonte.query(
        `SELECT tipo_grandeza AS grandeza, min(valor_limite)::float8 AS limite FROM regra_alerta
          WHERE ativa AND NOT sistema AND operador IN ('>', '>=') AND valor_limite > 0 AND tipo_grandeza IN ('nivel_agua', 'nivel_sonoro')
          GROUP BY tipo_grandeza`,
      ) as Promise<{ grandeza: string; limite: number }[]>,
      this.ocorrenciasHoje(),
      this.ocorrenciasPorBairro(),
    ]);
    const estacoes = leituras.filter((l) => l.grandeza === 'pm25').map((l) => l.dispositivoId);
    const mediasPm25: { dispositivoId: string; atual: number | null; anterior: number | null }[] =
      estacoes.length > 0 ? await this.fonte.query(MEDIAS_PM25, [estacoes]) : [];

    return {
      indicadores: calcularIndicadores({ leituras, alertas, limites, mediasPm25 }),
      ocorrenciasHoje,
      ocorrenciasPorBairro,
    };
  }

  // acumulado por hora de hoje contra a média das quatro semanas anteriores no mesmo dia, como no protótipo
  private async ocorrenciasHoje(): Promise<PontoHoraDto[]> {
    const linhas: { hora: number; hoje: number; media: number; agora: number }[] = await this.fonte.query(
      `WITH local AS (SELECT (now() AT TIME ZONE 'America/Sao_Paulo') AS agora),
            horas AS (SELECT generate_series(0, 23) AS hora),
            aberturas AS (
              SELECT (o.data_abertura AT TIME ZONE 'America/Sao_Paulo') AS quando FROM ocorrencia o, local
               WHERE (o.data_abertura AT TIME ZONE 'America/Sao_Paulo')::date IN (
                       SELECT (local.agora::date - 7 * n) FROM generate_series(0, 4) n))
       SELECT h.hora,
              (SELECT count(*) FROM aberturas, local
                WHERE quando::date = local.agora::date AND EXTRACT(HOUR FROM quando) <= h.hora)::int AS hoje,
              (SELECT count(*) FROM aberturas, local
                WHERE quando::date < local.agora::date AND EXTRACT(HOUR FROM quando) <= h.hora)::float8 / 4 AS media,
              EXTRACT(HOUR FROM (SELECT agora FROM local))::int AS agora
         FROM horas h ORDER BY h.hora`,
    );
    return linhas.map(({ hora, hoje, media: m, agora }) => ({ hora, hoje: hora <= agora ? hoje : null, media: m }));
  }

  private async ocorrenciasPorBairro(): Promise<BairroOcorrenciasDto[]> {
    return this.fonte.query(
      `SELECT COALESCE(b.nome, 'Zona rural') AS bairro, count(*)::int AS total
         FROM ocorrencia o LEFT JOIN bairro b ON b.id = o.bairro_id
        WHERE o.data_abertura > now() - interval '24 hours'
        GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 5`,
    );
  }
}

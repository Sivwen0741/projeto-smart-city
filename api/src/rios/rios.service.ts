import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SITUACAO } from '../dispositivos/dispositivos.service';
import { FONTE_OPEN_METEO } from './coleta-open-meteo.service';
import { RiosDto } from './dto/rios.dto';

const PONTOS = `
  SELECT d.id::text AS "dispositivoId", d.identificador, d.endereco, d.descricao, b.nome AS bairro,
         ${SITUACAO} AS situacao,
         COALESCE(d.origem_comunicacao = 'simulador', false) AS simulado,
         (SELECT a.criticidade FROM alerta a JOIN regra_alerta r ON r.id = a.regra_alerta_id
           WHERE a.dispositivo_id = d.id AND a.situacao IN ('aberto', 'em_atendimento') AND r.tipo_grandeza = 'nivel_agua'
           ORDER BY array_position(ARRAY['grave', 'atencao', 'informativo'], a.criticidade::text) LIMIT 1) AS "alertaAtivo",
         (SELECT json_build_object('dataHora', data_hora, 'valor', valor::float8) FROM leitura
           WHERE dispositivo_id = d.id AND tipo_grandeza = 'nivel_agua' AND fonte_dados_id IS NULL
           ORDER BY data_hora DESC LIMIT 1) AS nivel,
         (SELECT valor::float8 FROM leitura
           WHERE dispositivo_id = d.id AND tipo_grandeza = 'nivel_agua' AND fonte_dados_id IS NULL
             AND data_hora <= now() - interval '1 hour' AND data_hora > now() - interval '75 minutes'
           ORDER BY data_hora DESC LIMIT 1) AS "nivelUmaHora",
         COALESCE((SELECT json_agg(json_build_object('dataHora', faixa, 'valor', media) ORDER BY faixa)
            FROM (SELECT to_timestamp(floor(EXTRACT(EPOCH FROM data_hora) / 600) * 600) AS faixa, round(avg(valor), 3)::float8 AS media
                    FROM leitura
                   WHERE dispositivo_id = d.id AND tipo_grandeza = 'nivel_agua' AND fonte_dados_id IS NULL
                     AND data_hora > now() - interval '6 hours'
                   GROUP BY 1) s), '[]') AS "serieNivel",
         COALESCE((SELECT json_agg(json_build_object('data', to_char(data_hora AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD'), 'valor', valor::float8) ORDER BY data_hora)
            FROM leitura
           WHERE dispositivo_id = d.id AND tipo_grandeza = 'vazao' AND fonte_dados_id = f.id
             AND data_hora > now() - interval '8 days'), '[]') AS "serieVazao",
         COALESCE((SELECT json_agg(json_build_object('data', to_char(p.data, 'YYYY-MM-DD'), 'valor', p.valor::float8) ORDER BY p.data)
            FROM previsao p
           WHERE p.dispositivo_id = d.id AND p.fonte_dados_id = f.id AND p.tipo_grandeza = 'vazao'
             AND p.data > (now() AT TIME ZONE 'America/Sao_Paulo')::date), '[]') AS previsao
    FROM dispositivo d
    JOIN tipo_dispositivo t ON t.id = d.tipo_dispositivo_id
    LEFT JOIN bairro b ON b.id = d.bairro_id
    CROSS JOIN (SELECT id FROM fonte_dados WHERE nome = $1) f
   WHERE d.atributos_especificos->>'tipoGrandeza' = 'nivel_agua'
   ORDER BY array_position(ARRAY['operando', 'sem_comunicacao', 'manutencao', 'inativo'], ${SITUACAO}), d.identificador`;

@Injectable()
export class RiosService {
  constructor(private readonly fonte: DataSource) {}

  async consultar(): Promise<RiosDto> {
    const [cota] = await this.fonte.query(
      `SELECT valor_limite::float8 AS valor, operador, nome AS regra FROM regra_alerta
        WHERE ativa AND NOT sistema AND tipo_grandeza = 'nivel_agua' AND operador IN ('>', '>=')
        ORDER BY valor_limite LIMIT 1`,
    );
    const [coleta] = await this.fonte.query(
      `SELECT ultima_coleta AS "ultimaColeta", ultima_tentativa AS "ultimaTentativa", ultimo_erro AS erro FROM fonte_dados WHERE nome = $1`,
      [FONTE_OPEN_METEO],
    );
    const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
    const linhas = await this.fonte.query(PONTOS, [FONTE_OPEN_METEO]);
    return {
      cota: cota ?? null,
      coleta,
      pontos: linhas.map(
        ({ endereco, descricao, nivelUmaHora, ...p }: { endereco: string | null; descricao: string | null; nivelUmaHora: number | null } & Record<string, unknown>) => {
          const [nome, ...resto] = (endereco ?? descricao ?? (p.identificador as string)).split(',').map((parte) => parte.trim());
          const nivel = p.nivel as { valor: number } | null;
          const serieVazao = p.serieVazao as { data: string; valor: number }[];
          return {
            ...p,
            nome,
            complemento: resto.join(', ') || null,
            tendencia: nivel && nivelUmaHora !== null ? Math.round((nivel.valor - nivelUmaHora) * 1000) / 1000 : null,
            vazao: serieVazao.find((v) => v.data === hoje) ?? null,
          };
        },
      ),
    } as RiosDto;
  }
}

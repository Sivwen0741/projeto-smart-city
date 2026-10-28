import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { foraDoLimite } from './regra';

export interface LeituraGravada {
  id: string;
  dispositivoId: string | null;
  // us18: leitura do open-meteo para o bairro, sem dispositivo
  bairroId?: string | null;
  tipoGrandeza: string;
  valor: number;
  dataHora: Date;
}

interface Regra {
  id: string;
  operador: string;
  valorLimite: number;
  duracaoMinutos: number;
  criticidade: string;
}

// o operador vem de coluna com check, mas entra no sql só por esta lista
const OPERADORES_SQL: Record<string, string> = { '>': '>', '>=': '>=', '<': '<', '<=': '<=', '=': '=', '<>': '<>' };

// coluna que identifica de quem é a leitura; só estes dois valores entram no sql
const alvo = (leitura: LeituraGravada) =>
  leitura.dispositivoId
    ? { coluna: 'dispositivo_id', id: leitura.dispositivoId, conflito: `(regra_alerta_id, dispositivo_id) WHERE situacao IN ('aberto', 'em_atendimento')` }
    : { coluna: 'bairro_id', id: leitura.bairroId!, conflito: `(regra_alerta_id, bairro_id) WHERE situacao IN ('aberto', 'em_atendimento') AND bairro_id IS NOT NULL` };

export interface ResultadoAvaliacao {
  novos: string[];
  encerrados: string[];
}

@Injectable()
export class MotorAlertasService {
  async avaliar(m: EntityManager, leitura: LeituraGravada): Promise<ResultadoAvaliacao> {
    const regras: Regra[] = await m.query(
      `SELECT id::text AS id, operador, valor_limite::float8 AS "valorLimite", duracao_minutos AS "duracaoMinutos", criticidade
         FROM regra_alerta WHERE ativa AND tipo = 'simples' AND tipo_grandeza = $1`,
      [leitura.tipoGrandeza],
    );
    const resultado: ResultadoAvaliacao = { novos: [], encerrados: [] };
    for (const regra of regras) {
      if (!foraDoLimite(leitura.valor, regra.operador, regra.valorLimite)) {
        resultado.encerrados.push(...(await this.encerrarNormalizados(m, leitura, regra.id)));
        continue;
      }
      if (!(await this.duracaoCumprida(m, leitura, regra))) continue;
      const [alerta] = await m.query(
        `INSERT INTO alerta (regra_alerta_id, dispositivo_id, bairro_id, leitura_id, valor_observado, operador, valor_limite, criticidade, situacao)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'aberto')
         ON CONFLICT ${alvo(leitura).conflito} DO NOTHING
         RETURNING id::text`,
        [regra.id, leitura.dispositivoId, leitura.dispositivoId ? null : leitura.bairroId, leitura.id, leitura.valor, regra.operador, regra.valorLimite, regra.criticidade],
      );
      if (alerta) resultado.novos.push(alerta.id);
    }
    if (leitura.tipoGrandeza === 'nivel_agua' && leitura.dispositivoId) {
      const composto = await this.avaliarRiscoDeEnchente(m, leitura);
      resultado.novos.push(...composto.novos);
      resultado.encerrados.push(...composto.encerrados);
    }
    return resultado;
  }

  // us10: nível acima da cota e, no mesmo bairro, chuva ou vazão prevista acima do limite dentro da janela
  private async avaliarRiscoDeEnchente(m: EntityManager, leitura: LeituraGravada): Promise<ResultadoAvaliacao> {
    const regras: (Regra & { limitePrecipitacao: number; limiteVazaoPrevista: number; janelaHoras: number })[] = await m.query(
      `SELECT id::text AS id, operador, valor_limite::float8 AS "valorLimite", criticidade,
              limite_precipitacao::float8 AS "limitePrecipitacao", limite_vazao_prevista::float8 AS "limiteVazaoPrevista",
              janela_horas AS "janelaHoras"
         FROM regra_alerta WHERE ativa AND tipo = 'risco_enchente'`,
    );
    const resultado: ResultadoAvaliacao = { novos: [], encerrados: [] };
    for (const regra of regras) {
      if (!foraDoLimite(leitura.valor, regra.operador, regra.valorLimite)) {
        resultado.encerrados.push(...(await this.encerrarNormalizados(m, leitura, regra.id)));
        continue;
      }
      const complemento = await this.complementoDaEnchente(m, leitura, regra);
      if (!complemento) continue;
      const [{ identificador }] = await m.query(`SELECT identificador FROM dispositivo WHERE id = $1`, [leitura.dispositivoId]);
      const composicao = {
        nivel: { dispositivo: identificador, valor: leitura.valor, limite: regra.valorLimite, dataHora: leitura.dataHora },
        complemento,
      };
      const [alerta] = await m.query(
        `INSERT INTO alerta (regra_alerta_id, dispositivo_id, leitura_id, valor_observado, operador, valor_limite, criticidade, situacao, composicao)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'aberto', $8)
         ON CONFLICT (regra_alerta_id, dispositivo_id) WHERE situacao IN ('aberto', 'em_atendimento') DO NOTHING
         RETURNING id::text`,
        [regra.id, leitura.dispositivoId, leitura.id, leitura.valor, regra.operador, regra.valorLimite, regra.criticidade, JSON.stringify(composicao)],
      );
      if (alerta) resultado.novos.push(alerta.id);
    }
    return resultado;
  }

  // a maior chuva medida no bairro na janela; senão, a maior vazão do open-meteo de hoje até o fim da janela
  private async complementoDaEnchente(
    m: EntityManager,
    leitura: LeituraGravada,
    regra: { limitePrecipitacao: number; limiteVazaoPrevista: number; janelaHoras: number },
  ): Promise<Record<string, unknown> | null> {
    const [chuva] = await m.query(
      `SELECT 'precipitacao' AS grandeza, l.valor::float8 AS valor, $4::float8 AS limite, d.identificador AS dispositivo, l.data_hora AS "dataHora"
         FROM leitura l
         JOIN dispositivo d ON d.id = l.dispositivo_id
         JOIN dispositivo s ON s.id = $1
        WHERE l.tipo_grandeza = 'precipitacao' AND d.bairro_id = s.bairro_id
          AND l.data_hora > $2::timestamptz - $3 * interval '1 hour' AND l.data_hora <= $2::timestamptz
          AND l.valor >= $4
        ORDER BY l.valor DESC, l.data_hora DESC LIMIT 1`,
      [leitura.dispositivoId, leitura.dataHora, regra.janelaHoras, regra.limitePrecipitacao],
    );
    if (chuva) return chuva;
    const [vazao] = await m.query(
      `SELECT 'vazao_prevista' AS grandeza, v.valor, $4::float8 AS limite, v.dispositivo, v.data
         FROM (
           SELECT p.valor::float8 AS valor, d.identificador AS dispositivo, to_char(p.data, 'YYYY-MM-DD') AS data
             FROM previsao p JOIN dispositivo d ON d.id = p.dispositivo_id
            WHERE p.tipo_grandeza = 'vazao' AND (d.id = $1 OR d.bairro_id = (SELECT bairro_id FROM dispositivo WHERE id = $1))
              AND p.data BETWEEN ($2::timestamptz AT TIME ZONE 'America/Sao_Paulo')::date
                             AND (($2::timestamptz + $3 * interval '1 hour') AT TIME ZONE 'America/Sao_Paulo')::date
           UNION ALL
           SELECT l.valor::float8, d.identificador, to_char(l.data_hora AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD')
             FROM leitura l JOIN dispositivo d ON d.id = l.dispositivo_id
            WHERE l.tipo_grandeza = 'vazao' AND l.fonte_dados_id IS NOT NULL
              AND (d.id = $1 OR d.bairro_id = (SELECT bairro_id FROM dispositivo WHERE id = $1))
              AND (l.data_hora AT TIME ZONE 'America/Sao_Paulo')::date = ($2::timestamptz AT TIME ZONE 'America/Sao_Paulo')::date
         ) v
        WHERE v.valor >= $4
        ORDER BY v.valor DESC LIMIT 1`,
      [leitura.dispositivoId, leitura.dataHora, regra.janelaHoras, regra.limiteVazaoPrevista],
    );
    return vazao ?? null;
  }

  // us28: sem reconhecimento, só o grave continua ativo quando a leitura volta ao normal.
  // a condição é a copiada no disparo, para a edição da regra não mudar o destino do alerta
  private async encerrarNormalizados(m: EntityManager, leitura: LeituraGravada, regraId: string): Promise<string[]> {
    // em update, o driver do postgres devolve [linhas, quantidade]
    const [encerrados]: [{ id: string }[], number] = await m.query(
      `UPDATE alerta SET situacao = 'encerrado', data_encerramento = now()
        WHERE regra_alerta_id = $1 AND ${alvo(leitura).coluna} = $2 AND situacao = 'aberto' AND criticidade <> 'grave'
          AND NOT CASE operador
                WHEN '>' THEN $3::numeric > valor_limite
                WHEN '>=' THEN $3::numeric >= valor_limite
                WHEN '<' THEN $3::numeric < valor_limite
                WHEN '<=' THEN $3::numeric <= valor_limite
                WHEN '=' THEN $3::numeric = valor_limite
                ELSE $3::numeric <> valor_limite
              END
       RETURNING id::text`,
      [regraId, alvo(leitura).id, leitura.valor],
    );
    return encerrados.map((a) => a.id);
  }

  // a condição conta desde a primeira leitura da sequência ininterrupta fora do limite
  private async duracaoCumprida(m: EntityManager, leitura: LeituraGravada, regra: Regra): Promise<boolean> {
    if (regra.duracaoMinutos === 0) return true;
    const operador = OPERADORES_SQL[regra.operador];
    const { coluna, id } = alvo(leitura);
    const [{ inicio }] = await m.query(
      `SELECT min(data_hora) AS inicio
         FROM leitura
        WHERE ${coluna} = $1 AND tipo_grandeza = $2 AND data_hora <= $3
          AND data_hora > COALESCE(
                (SELECT max(data_hora) FROM leitura
                  WHERE ${coluna} = $1 AND tipo_grandeza = $2 AND data_hora <= $3
                    AND NOT (valor ${operador} $4::numeric)),
                '-infinity')`,
      [id, leitura.tipoGrandeza, leitura.dataHora, regra.valorLimite],
    );
    return leitura.dataHora.getTime() - new Date(inicio).getTime() >= regra.duracaoMinutos * 60_000;
  }
}

import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

export interface LeituraGravada {
  id: string;
  dispositivoId: string;
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

export function foraDoLimite(valor: number, operador: string, limite: number): boolean {
  switch (operador) {
    case '>':
      return valor > limite;
    case '>=':
      return valor >= limite;
    case '<':
      return valor < limite;
    case '<=':
      return valor <= limite;
    case '=':
      return valor === limite;
    case '<>':
      return valor !== limite;
    default:
      return false;
  }
}

@Injectable()
export class MotorAlertasService {
  async avaliar(m: EntityManager, leitura: LeituraGravada): Promise<string[]> {
    const regras: Regra[] = await m.query(
      `SELECT id::text AS id, operador, valor_limite::float8 AS "valorLimite", duracao_minutos AS "duracaoMinutos", criticidade
         FROM regra_alerta WHERE ativa AND tipo_grandeza = $1`,
      [leitura.tipoGrandeza],
    );
    const emitidos: string[] = [];
    for (const regra of regras) {
      if (!foraDoLimite(leitura.valor, regra.operador, regra.valorLimite)) continue;
      if (!(await this.duracaoCumprida(m, leitura, regra))) continue;
      const [alerta] = await m.query(
        `INSERT INTO alerta (regra_alerta_id, dispositivo_id, leitura_id, valor_observado, operador, valor_limite, criticidade, situacao)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'aberto')
         ON CONFLICT (regra_alerta_id, dispositivo_id) WHERE situacao IN ('aberto', 'em_atendimento') DO NOTHING
         RETURNING id::text`,
        [regra.id, leitura.dispositivoId, leitura.id, leitura.valor, regra.operador, regra.valorLimite, regra.criticidade],
      );
      if (alerta) emitidos.push(alerta.id);
    }
    return emitidos;
  }

  // a condição conta desde a primeira leitura da sequência ininterrupta fora do limite
  private async duracaoCumprida(m: EntityManager, leitura: LeituraGravada, regra: Regra): Promise<boolean> {
    if (regra.duracaoMinutos === 0) return true;
    const operador = OPERADORES_SQL[regra.operador];
    const [{ inicio }] = await m.query(
      `SELECT min(data_hora) AS inicio
         FROM leitura
        WHERE dispositivo_id = $1 AND tipo_grandeza = $2 AND data_hora <= $3
          AND data_hora > COALESCE(
                (SELECT max(data_hora) FROM leitura
                  WHERE dispositivo_id = $1 AND tipo_grandeza = $2 AND data_hora <= $3
                    AND NOT (valor ${operador} $4::numeric)),
                '-infinity')`,
      [leitura.dispositivoId, leitura.tipoGrandeza, leitura.dataHora, regra.valorLimite],
    );
    return leitura.dataHora.getTime() - new Date(inicio).getTime() >= regra.duracaoMinutos * 60_000;
  }
}

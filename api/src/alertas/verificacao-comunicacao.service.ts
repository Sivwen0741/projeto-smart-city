import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LIMITE_COMUNICACAO, SITUACAO } from '../dispositivos/dispositivos.service';
import { SEM_COMUNICACAO } from '../grandezas';
import { EventosAlertasService } from './eventos-alertas.service';

const INTERVALO_PADRAO_SEGUNDOS = 60;

@Injectable()
export class VerificacaoComunicacaoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VerificacaoComunicacaoService.name);
  private temporizador?: NodeJS.Timeout;
  private emAndamento = false;

  constructor(
    private readonly fonte: DataSource,
    private readonly eventos: EventosAlertasService,
  ) {}

  onModuleInit(): void {
    // zero desliga a rotina; os testes chamam verificar() direto
    const segundos = Number(process.env.VERIFICACAO_COMUNICACAO_SEGUNDOS ?? INTERVALO_PADRAO_SEGUNDOS);
    if (!segundos) return;
    this.temporizador = setInterval(() => this.executar(), segundos * 1000);
    this.logger.log(`verificação de comunicação a cada ${segundos} s`);
  }

  onModuleDestroy(): void {
    clearInterval(this.temporizador);
  }

  private async executar(): Promise<void> {
    if (this.emAndamento) return;
    this.emAndamento = true;
    try {
      const novos = await this.verificar();
      if (novos.length > 0) this.logger.log(`alertas de sem comunicação emitidos: ${novos.join(', ')}`);
    } catch (erro) {
      this.logger.error(`falha na verificação de comunicação: ${(erro as Error).message}`);
    } finally {
      this.emAndamento = false;
    }
  }

  async verificar(): Promise<string[]> {
    // valores em minutos; quem nunca comunicou conta desde a instalação, ou fica no próprio limite
    const novos: { id: string }[] = await this.fonte.query(
      `INSERT INTO alerta (regra_alerta_id, dispositivo_id, valor_observado, operador, valor_limite, criticidade, situacao)
       SELECT r.id, d.id,
              round((EXTRACT(EPOCH FROM now() - COALESCE(d.ultima_comunicacao, d.data_instalacao::timestamptz, now() - ${LIMITE_COMUNICACAO} * interval '1 second')) / 60)::numeric, 1),
              r.operador, round(${LIMITE_COMUNICACAO} / 60.0, 1), r.criticidade, 'aberto'
         FROM dispositivo d
         JOIN tipo_dispositivo t ON t.id = d.tipo_dispositivo_id
         JOIN regra_alerta r ON r.sistema AND r.ativa AND r.tipo_grandeza = $1
        WHERE ${SITUACAO} = 'sem_comunicacao'
       ON CONFLICT (regra_alerta_id, dispositivo_id) WHERE situacao IN ('aberto', 'em_atendimento') DO NOTHING
       RETURNING id::text`,
      [SEM_COMUNICACAO],
    );
    const ids = novos.map((a) => a.id);
    await this.eventos.novos(ids);
    return ids;
  }
}

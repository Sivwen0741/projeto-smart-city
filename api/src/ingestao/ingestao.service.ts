import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { connect, MqttClient } from 'mqtt';
import { Subject } from 'rxjs';
import { DataSource } from 'typeorm';
import { EventosAlertasService } from '../alertas/eventos-alertas.service';
import { LeituraGravada, MotorAlertasService, ResultadoAvaliacao } from '../alertas/motor-alertas.service';
import { grandezasMedidas } from '../dispositivos/atributos';
import { CODIGOS_GRANDEZA, SEM_COMUNICACAO, Grandeza, GRANDEZAS } from '../grandezas';

export const TOPICO_LEITURAS = 'scoc/dispositivos/+/leituras';

interface LeituraRecebida {
  grandeza: Grandeza;
  valor: number;
  unidade: string;
}

export const ORIGENS = ['mqtt', 'simulador'] as const;

interface Mensagem {
  dataHora: Date;
  origem: (typeof ORIGENS)[number];
  leituras: LeituraRecebida[];
}

export class MensagemRecusada extends Error {}

// formato em docs/decisoes/2026-10-24-ingestao-mqtt.md
export function interpretar(conteudo: Buffer): Mensagem {
  let corpo: unknown;
  try {
    corpo = JSON.parse(conteudo.toString('utf8'));
  } catch {
    throw new MensagemRecusada('conteúdo não é JSON');
  }
  if (typeof corpo !== 'object' || corpo === null || Array.isArray(corpo)) throw new MensagemRecusada('conteúdo não é um objeto');
  const { dataHora, origem = 'mqtt', leituras = [] } = corpo as { dataHora?: unknown; origem?: unknown; leituras?: unknown };
  if (!ORIGENS.includes(origem as never)) throw new MensagemRecusada(`origem desconhecida: ${String(origem)}`);

  let quando = new Date();
  if (dataHora !== undefined) {
    quando = new Date(typeof dataHora === 'string' ? dataHora : NaN);
    if (Number.isNaN(quando.getTime())) throw new MensagemRecusada('dataHora inválida');
  }
  if (!Array.isArray(leituras)) throw new MensagemRecusada('leituras deve ser uma lista');

  return {
    dataHora: quando,
    origem: origem as Mensagem['origem'],
    leituras: leituras.map((l: { grandeza?: unknown; valor?: unknown; unidade?: unknown }) => {
      if (typeof l?.grandeza !== 'string' || !CODIGOS_GRANDEZA.includes(l.grandeza as Grandeza)) {
        throw new MensagemRecusada(`grandeza desconhecida: ${String(l?.grandeza)}`);
      }
      if (typeof l.valor !== 'number' || !Number.isFinite(l.valor)) throw new MensagemRecusada(`valor inválido para ${l.grandeza}`);
      const grandeza = l.grandeza as Grandeza;
      return { grandeza, valor: l.valor, unidade: typeof l.unidade === 'string' ? l.unidade.slice(0, 20) : GRANDEZAS[grandeza].unidade };
    }),
  };
}

@Injectable()
export class IngestaoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IngestaoService.name);
  private cliente?: MqttClient;
  // mensagens processadas uma a uma: a duração das regras depende da ordem das leituras
  private fila: Promise<void> = Promise.resolve();
  // avisa o tempo real das grandezas gravadas, depois do commit
  readonly leituras = new Subject<{ dispositivoId: string; grandezas: string[] }>();

  constructor(
    private readonly fonte: DataSource,
    private readonly motor: MotorAlertasService,
    private readonly eventos: EventosAlertasService,
  ) {}

  onModuleInit(): void {
    const url = process.env.MQTT_URL;
    if (!url) {
      this.logger.warn('MQTT_URL não definida: ingestão de leituras desligada');
      return;
    }
    this.cliente = connect(url, { clientId: `scoc-api-${randomUUID()}`, reconnectPeriod: 2000, connectTimeout: 5000 });
    this.cliente.on('connect', () => {
      this.logger.log(`conectado ao broker, assinando ${TOPICO_LEITURAS}`);
      this.cliente!.subscribe(TOPICO_LEITURAS, { qos: 1 });
    });
    this.cliente.on('offline', () => this.logger.warn('broker indisponível, tentando reconectar'));
    this.cliente.on('error', (erro) => this.logger.warn(`erro no cliente mqtt: ${erro.message}`));
    this.cliente.on('message', (topico, conteudo) => {
      this.fila = this.fila.then(() => this.receber(topico, conteudo));
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.cliente?.endAsync(true);
  }

  private async receber(topico: string, conteudo: Buffer): Promise<void> {
    const codigo = topico.split('/')[2];
    try {
      const mensagem = interpretar(conteudo);
      const { novos, encerrados, dispositivoId } = await this.gravar(codigo, mensagem);
      if (mensagem.leituras.length > 0) this.leituras.next({ dispositivoId, grandezas: mensagem.leituras.map((l) => l.grandeza) });
      if (novos.length > 0) this.logger.log(`alertas emitidos para ${codigo}: ${novos.join(', ')}`);
      if (encerrados.length > 0) this.logger.log(`alertas encerrados por normalização em ${codigo}: ${encerrados.join(', ')}`);
      await Promise.all([this.eventos.novos(novos), ...encerrados.map((id) => this.eventos.atualizado(id))]).catch((erro) =>
        this.logger.error(`falha ao avisar as telas: ${erro.message}`),
      );
    } catch (erro) {
      if (erro instanceof MensagemRecusada) this.logger.warn(`mensagem descartada de ${codigo}: ${erro.message}`);
      else this.logger.error(`falha ao gravar mensagem de ${codigo}: ${(erro as Error).message}`);
    }
  }

  async gravar(codigo: string, mensagem: Mensagem): Promise<ResultadoAvaliacao & { dispositivoId: string }> {
    return this.fonte.transaction(async (m) => {
      const [dispositivo] = await m.query(
        `SELECT d.id::text AS id, d.estado, t.categoria, d.atributos_especificos AS atributos
           FROM dispositivo d JOIN tipo_dispositivo t ON t.id = d.tipo_dispositivo_id
          WHERE upper(d.identificador) = upper($1::varchar)`,
        [codigo],
      );
      if (!dispositivo) throw new MensagemRecusada('dispositivo não cadastrado');
      if (dispositivo.estado === 'inativo') throw new MensagemRecusada('dispositivo inativo');
      const medidas = grandezasMedidas(dispositivo.categoria, dispositivo.atributos);
      const estranha = mensagem.leituras.find((l) => !medidas.includes(l.grandeza));
      if (estranha) throw new MensagemRecusada(`o dispositivo não mede ${estranha.grandeza}`);

      const gravadas: LeituraGravada[] = [];
      for (const l of mensagem.leituras) {
        const [{ id }] = await m.query(
          `INSERT INTO leitura (dispositivo_id, tipo_grandeza, valor, unidade, origem, data_hora)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id::text`,
          [dispositivo.id, l.grandeza, l.valor, l.unidade, mensagem.origem, mensagem.dataHora],
        );
        gravadas.push({ id, dispositivoId: dispositivo.id, tipoGrandeza: l.grandeza, valor: l.valor, dataHora: mensagem.dataHora });
      }
      await m.query(`UPDATE dispositivo SET ultima_comunicacao = now(), origem_comunicacao = $2 WHERE id = $1`, [dispositivo.id, mensagem.origem]);

      // us07-3: voltou a comunicar, o alerta de sem comunicação ainda não reconhecido se encerra
      const [religados]: [{ id: string }[], number] = await m.query(
        `UPDATE alerta SET situacao = 'encerrado', data_encerramento = now()
          WHERE dispositivo_id = $1 AND situacao = 'aberto'
            AND regra_alerta_id IN (SELECT id FROM regra_alerta WHERE sistema AND tipo_grandeza = $2)
        RETURNING id::text`,
        [dispositivo.id, SEM_COMUNICACAO],
      );

      // em manutenção a leitura fica no histórico, mas não gera alerta
      const resultado = { novos: [] as string[], encerrados: religados.map((a) => a.id), dispositivoId: dispositivo.id as string };
      if (dispositivo.estado !== 'ativo') return resultado;
      for (const leitura of gravadas) {
        const { novos, encerrados } = await this.motor.avaliar(m, leitura);
        resultado.novos.push(...novos);
        resultado.encerrados.push(...encerrados);
      }
      return resultado;
    });
  }
}

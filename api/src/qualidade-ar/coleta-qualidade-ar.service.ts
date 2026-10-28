import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventosAlertasService } from '../alertas/eventos-alertas.service';
import { MotorAlertasService } from '../alertas/motor-alertas.service';

export const FONTE_QUALIDADE_AR = 'Open-Meteo Air Quality API';
const INTERVALO_PADRAO_MINUTOS = 60;
const TEMPO_LIMITE_MS = 15_000;

const GRANDEZAS: Record<string, 'pm2_5' | 'pm10'> = { pm25: 'pm2_5', pm10: 'pm10' };

interface RespostaPonto {
  hourly?: { time?: string[]; pm2_5?: (number | null)[]; pm10?: (number | null)[] };
}

interface Bairro {
  id: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class ColetaQualidadeArService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ColetaQualidadeArService.name);
  private temporizador?: NodeJS.Timeout;
  private primeira?: NodeJS.Timeout;

  constructor(
    private readonly fonte: DataSource,
    private readonly motor: MotorAlertasService,
    private readonly eventos: EventosAlertasService,
  ) {}

  onModuleInit(): void {
    // mesma chave da coleta dos rios: zero desliga, e os testes chamam coletar() direto
    const minutos = Number(process.env.OPEN_METEO_INTERVALO_MINUTOS ?? INTERVALO_PADRAO_MINUTOS);
    if (!minutos) return;
    this.primeira = setTimeout(() => this.coletar(), 10_000);
    this.temporizador = setInterval(() => this.coletar(), minutos * 60_000);
  }

  onModuleDestroy(): void {
    clearTimeout(this.primeira);
    clearInterval(this.temporizador);
  }

  // nunca lança: a falha fica registrada na fonte e a rotina segue no próximo ciclo
  async coletar(): Promise<{ sucesso: boolean; leituras: number; alertas: string[]; erro?: string }> {
    const [fonte] = await this.fonte.query(`SELECT id::text AS id, url_base AS url FROM fonte_dados WHERE nome = $1`, [FONTE_QUALIDADE_AR]);
    const bairros: Bairro[] = await this.fonte.query(
      `SELECT id::text AS id, ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro ORDER BY id`,
    );
    try {
      const respostas = await this.consultar(fonte.url, bairros);
      const { leituras, novos, encerrados } = await this.gravar(fonte.id, bairros, respostas);
      await this.fonte.query(`UPDATE fonte_dados SET ultima_tentativa = now(), ultima_coleta = now(), ultimo_erro = NULL WHERE id = $1`, [fonte.id]);
      await Promise.all([this.eventos.novos(novos), ...encerrados.map((id) => this.eventos.atualizado(id))]).catch(() => undefined);
      return { sucesso: true, leituras, alertas: novos };
    } catch (erro) {
      const mensagem = (erro as Error).message;
      await this.fonte.query(`UPDATE fonte_dados SET ultima_tentativa = now(), ultimo_erro = $2 WHERE id = $1`, [fonte.id, mensagem]);
      this.logger.warn(`coleta da qualidade do ar falhou: ${mensagem}`);
      return { sucesso: false, leituras: 0, alertas: [], erro: mensagem };
    }
  }

  // uma requisição só para todos os bairros, por causa do limite diário da fonte
  private async consultar(base: string, bairros: Bairro[]): Promise<RespostaPonto[]> {
    const url = new URL(process.env.OPEN_METEO_AR_URL ?? base);
    url.search = new URLSearchParams({
      latitude: bairros.map((b) => b.latitude.toFixed(5)).join(','),
      longitude: bairros.map((b) => b.longitude.toFixed(5)).join(','),
      hourly: 'pm2_5,pm10',
      past_days: '1',
      forecast_days: '1',
      timezone: 'GMT',
    }).toString();
    const resposta = await fetch(url, { signal: AbortSignal.timeout(TEMPO_LIMITE_MS), headers: { 'User-Agent': 'scoc-ponta-grossa' } });
    if (!resposta.ok) throw new Error(`Open-Meteo respondeu HTTP ${resposta.status}`);
    const corpo = (await resposta.json()) as RespostaPonto | RespostaPonto[];
    const lista = Array.isArray(corpo) ? corpo : [corpo];
    if (lista.length !== bairros.length) throw new Error(`resposta do Open-Meteo com ${lista.length} pontos para ${bairros.length} bairros`);
    return lista;
  }

  private async gravar(fonteId: string, bairros: Bairro[], respostas: RespostaPonto[]) {
    const agora = Date.now();
    let leituras = 0;
    const novos: string[] = [];
    const encerrados: string[] = [];
    await this.fonte.transaction(async (m) => {
      for (const [i, bairro] of bairros.entries()) {
        const horas = respostas[i].hourly?.time ?? [];
        for (const [grandeza, campo] of Object.entries(GRANDEZAS)) {
          const valores = respostas[i].hourly?.[campo] ?? [];
          let ultima: { id: string; valor: number; dataHora: Date } | null = null;
          for (const [j, hora] of horas.entries()) {
            const valor = valores[j];
            const dataHora = new Date(`${hora}Z`);
            if (valor === null || valor === undefined || dataHora.getTime() > agora) continue;
            const [linha] = await m.query(
              `INSERT INTO leitura (bairro_id, fonte_dados_id, tipo_grandeza, valor, unidade, origem, data_hora)
               VALUES ($1, $2, $3, $4, 'µg/m³', 'open-meteo', $5)
               ON CONFLICT (bairro_id, tipo_grandeza, data_hora, fonte_dados_id) WHERE bairro_id IS NOT NULL
               DO UPDATE SET valor = EXCLUDED.valor
               RETURNING id::text`,
              [bairro.id, fonteId, grandeza, valor, dataHora],
            );
            leituras++;
            if (!ultima || dataHora > ultima.dataHora) ultima = { id: linha.id, valor, dataHora };
          }
          // as regras da us23 valem para a hora mais recente de cada bairro (us18-1)
          if (ultima) {
            const r = await this.motor.avaliar(m, { ...ultima, dispositivoId: null, bairroId: bairro.id, tipoGrandeza: grandeza });
            novos.push(...r.novos);
            encerrados.push(...r.encerrados);
          }
        }
      }
    });
    return { leituras, novos, encerrados };
  }
}

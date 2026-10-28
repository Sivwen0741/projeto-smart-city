import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subject } from 'rxjs';
import { DataSource } from 'typeorm';

export const FONTE_OPEN_METEO = 'Open-Meteo Flood API';
const INTERVALO_PADRAO_MINUTOS = 60;
const TEMPO_LIMITE_MS = 15_000;

// pontos monitorados: os sensores de nível de água, ativos ou não (a vazão do rio continua valendo)
export const PONTOS_MONITORADOS = `
  SELECT d.id::text AS id, ST_Y(d.localizacao::geometry) AS latitude, ST_X(d.localizacao::geometry) AS longitude
    FROM dispositivo d
   WHERE d.atributos_especificos->>'tipoGrandeza' = 'nivel_agua'
   ORDER BY d.id`;

interface RespostaFlood {
  daily?: { time?: string[]; river_discharge?: (number | null)[] };
}

@Injectable()
export class ColetaOpenMeteoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ColetaOpenMeteoService.name);
  private temporizador?: NodeJS.Timeout;
  private primeira?: NodeJS.Timeout;
  readonly coletas = new Subject<void>();

  constructor(private readonly fonte: DataSource) {}

  onModuleInit(): void {
    // zero desliga a rotina; os testes chamam coletar() direto
    const minutos = Number(process.env.OPEN_METEO_INTERVALO_MINUTOS ?? INTERVALO_PADRAO_MINUTOS);
    if (!minutos) return;
    this.primeira = setTimeout(() => this.coletar(), 5_000);
    this.temporizador = setInterval(() => this.coletar(), minutos * 60_000);
    this.logger.log(`coleta do Open-Meteo a cada ${minutos} min`);
  }

  onModuleDestroy(): void {
    clearTimeout(this.primeira);
    clearInterval(this.temporizador);
  }

  // nunca lança: a falha fica registrada na fonte e a rotina segue no próximo ciclo (us09-4)
  async coletar(): Promise<{ sucesso: boolean; leituras: number; erro?: string }> {
    const [fonte] = await this.fonte.query(`SELECT id::text AS id, url_base AS url FROM fonte_dados WHERE nome = $1`, [FONTE_OPEN_METEO]);
    const pontos: { id: string; latitude: number; longitude: number }[] = await this.fonte.query(PONTOS_MONITORADOS);
    try {
      let leituras = 0;
      for (const ponto of pontos) leituras += await this.coletarPonto(fonte, ponto);
      await this.fonte.query(`UPDATE fonte_dados SET ultima_tentativa = now(), ultima_coleta = now(), ultimo_erro = NULL WHERE id = $1`, [fonte.id]);
      this.coletas.next();
      return { sucesso: true, leituras };
    } catch (erro) {
      const mensagem = (erro as Error).message;
      await this.fonte.query(`UPDATE fonte_dados SET ultima_tentativa = now(), ultimo_erro = $2 WHERE id = $1`, [fonte.id, mensagem]);
      this.logger.warn(`coleta do Open-Meteo falhou: ${mensagem}`);
      this.coletas.next();
      return { sucesso: false, leituras: 0, erro: mensagem };
    }
  }

  private async coletarPonto(fonte: { id: string; url: string }, ponto: { id: string; latitude: number; longitude: number }): Promise<number> {
    const url = new URL(process.env.OPEN_METEO_FLOOD_URL ?? fonte.url);
    url.search = new URLSearchParams({
      latitude: String(ponto.latitude),
      longitude: String(ponto.longitude),
      daily: 'river_discharge',
      past_days: '7',
      forecast_days: '4',
      timezone: 'America/Sao_Paulo',
    }).toString();
    const resposta = await fetch(url, { signal: AbortSignal.timeout(TEMPO_LIMITE_MS), headers: { 'User-Agent': 'scoc-ponta-grossa' } });
    if (!resposta.ok) throw new Error(`Open-Meteo respondeu HTTP ${resposta.status}`);
    const corpo = (await resposta.json()) as RespostaFlood;
    const dias = corpo.daily?.time ?? [];
    const valores = corpo.daily?.river_discharge ?? [];
    if (dias.length === 0 || dias.length !== valores.length) throw new Error('resposta do Open-Meteo sem vazão diária');

    const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
    let gravadas = 0;
    await this.fonte.transaction(async (m) => {
      for (const [i, dia] of dias.entries()) {
        const valor = valores[i];
        if (valor === null || valor === undefined) continue;
        if (dia <= hoje) {
          // valor diário gravado ao meio-dia local, para cair no dia certo em qualquer fuso
          await m.query(
            `INSERT INTO leitura (dispositivo_id, fonte_dados_id, tipo_grandeza, valor, unidade, origem, data_hora)
             VALUES ($1, $2, 'vazao', $3, 'm³/s', 'open-meteo', ($4::date + time '12:00') AT TIME ZONE 'America/Sao_Paulo')
             ON CONFLICT (dispositivo_id, tipo_grandeza, data_hora, fonte_dados_id) WHERE fonte_dados_id IS NOT NULL
             DO UPDATE SET valor = EXCLUDED.valor`,
            [ponto.id, fonte.id, valor, dia],
          );
          gravadas++;
        } else {
          await m.query(
            `INSERT INTO previsao (dispositivo_id, fonte_dados_id, tipo_grandeza, data, valor)
             VALUES ($1, $2, 'vazao', $3, $4)
             ON CONFLICT (dispositivo_id, fonte_dados_id, tipo_grandeza, data) DO UPDATE SET valor = EXCLUDED.valor, coletada_em = now()`,
            [ponto.id, fonte.id, dia, valor],
          );
        }
      }
    });
    return gravadas;
  }
}

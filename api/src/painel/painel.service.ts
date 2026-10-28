import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { classificarIqar, iqarDePm25 } from '../qualidade-ar/iqar';
import { BairroOcorrenciasDto, IndicadorDto, PainelDto, PontoHoraDto } from './dto/painel.dto';

interface Leitura {
  dispositivoId: string;
  identificador: string;
  endereco: string | null;
  bairro: string | null;
  grandeza: string;
  valor: number;
  // valor do mesmo dispositivo cerca de uma hora antes, para a variação
  anterior: number | null;
  quantidadePontos: number | null;
}

const GRANDEZAS: Record<string, string[]> = {
  rios: ['nivel_agua'],
  fluxo: ['velocidade_media'],
  ar: ['pm25'],
  iluminacao: ['pontos_apagados'],
  ruido: ['nivel_sonoro'],
  vagas: ['vagas_livres'],
};

const NOMES: Record<string, string> = {
  rios: 'Nível dos rios',
  fluxo: 'Fluxo de veículos',
  ar: 'Qualidade do ar',
  iluminacao: 'Iluminação pública',
  ruido: 'Ruído urbano',
  vagas: 'Vagas públicas',
};

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

const numero = (valor: number, casas: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(valor);
const sinal = (valor: number, casas: number) => `${valor > 0 ? '+' : valor < 0 ? '−' : ''}${numero(Math.abs(valor), casas)}`;
const media = (valores: number[]) => valores.reduce((s, v) => s + v, 0) / valores.length;
const limitar = (valor: number) => Math.max(0, Math.min(1, valor));
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
const nomeDoPonto = (l: Leitura) => (l.endereco ?? l.identificador).split(',')[0].trim();

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

    const de = (chave: string) => leituras.filter((l) => GRANDEZAS[chave].includes(l.grandeza));
    const limite = (grandeza: string) => limites.find((l) => l.grandeza === grandeza)?.limite ?? null;
    const estado = (chave: string): IndicadorDto['estado'] => {
      const criticidades = alertas.filter((a) => GRANDEZAS[chave].includes(a.grandeza)).map((a) => a.criticidade);
      if (criticidades.includes('grave')) return 'grave';
      if (criticidades.includes('atencao')) return 'atencao';
      return 'estavel';
    };
    const indicador = (chave: string, unidade: string, casas: number, calcular: (ls: Leitura[]) => Omit<IndicadorDto, 'chave' | 'nome' | 'unidade' | 'casas' | 'estado'>): IndicadorDto => {
      const ls = de(chave);
      if (ls.length === 0) {
        return { chave, nome: NOMES[chave], valor: null, unidade, casas, variacao: null, proporcao: null, nota: 'sem leitura na última hora', estado: 'sem_dados' };
      }
      return { chave, nome: NOMES[chave], unidade, casas, estado: estado(chave), ...calcular(ls) };
    };

    return {
      indicadores: [
        indicador('rios', 'm', 2, (ls) => {
          const maior = ls.reduce((m, l) => (l.valor > m.valor ? l : m));
          const cota = limite('nivel_agua');
          const acima = cota !== null ? ls.filter((l) => l.valor > cota) : [];
          return {
            valor: maior.valor,
            variacao: maior.anterior !== null ? `${sinal(maior.valor - maior.anterior, 2)} m/h` : null,
            proporcao: cota !== null ? limitar(maior.valor / (cota / 0.8)) : null,
            nota:
              acima.length > 0
                ? `${nomeDoPonto(acima.reduce((m, l) => (l.valor > m.valor ? l : m)))} acima da cota`
                : `${plural(ls.length, 'ponto', 'pontos')} abaixo da cota`,
          };
        }),
        indicador('fluxo', 'km/h', 0, (ls) => {
          const atual = media(ls.map((l) => l.valor));
          const antes = ls.filter((l) => l.anterior !== null);
          return {
            valor: atual,
            variacao: antes.length > 0 ? `${sinal(atual - media(antes.map((l) => l.anterior!)), 0)} km/h` : null,
            proporcao: limitar(atual / 60),
            nota: plural(ls.length, 'via monitorada', 'vias monitoradas'),
          };
        }),
        indicador('ar', 'IQAr', 0, (ls) => {
          const indices = ls.map((l) => {
            const m = mediasPm25.find((x) => x.dispositivoId === l.dispositivoId);
            return { l, iqar: iqarDePm25(m?.atual ?? l.valor), antes: m?.anterior != null ? iqarDePm25(m.anterior) : null };
          });
          const pior = indices.reduce((m, i) => (i.iqar > m.iqar ? i : m));
          const { nome } = classificarIqar(pior.iqar);
          const bairros = new Set(indices.filter((i) => classificarIqar(i.iqar).nome === nome).map((i) => i.l.bairro ?? i.l.identificador));
          const delta = pior.antes !== null ? pior.iqar - pior.antes : null;
          return {
            valor: pior.iqar,
            variacao: delta === null ? null : Math.abs(delta) <= 5 ? 'estável' : sinal(delta, 0),
            proporcao: limitar(pior.iqar / 200),
            nota: `${nome} em ${plural(bairros.size, 'bairro', 'bairros')}`,
          };
        }),
        indicador('iluminacao', '%', 1, (ls) => {
          const total = ls.reduce((s, l) => s + (l.quantidadePontos ?? 0), 0);
          const apagados = ls.reduce((s, l) => s + l.valor, 0);
          const funcionando = total > 0 ? (1 - apagados / total) * 100 : null;
          const antes = ls.every((l) => l.anterior !== null) && total > 0 ? (1 - ls.reduce((s, l) => s + l.anterior!, 0) / total) * 100 : null;
          return {
            valor: funcionando,
            variacao: funcionando !== null && antes !== null ? `${sinal(funcionando - antes, 1)} pt` : null,
            proporcao: funcionando !== null ? funcionando / 100 : null,
            nota: plural(apagados, 'ponto sem resposta', 'pontos sem resposta'),
          };
        }),
        indicador('ruido', 'dB', 0, (ls) => {
          const maior = ls.reduce((m, l) => (l.valor > m.valor ? l : m));
          const teto = limite('nivel_sonoro');
          const delta = maior.anterior !== null ? maior.valor - maior.anterior : null;
          return {
            valor: maior.valor,
            variacao: delta === null ? null : Math.abs(delta) < 1 ? 'estável' : `${sinal(delta, 0)} dB`,
            proporcao: limitar(maior.valor / 100),
            nota: teto === null ? `${plural(ls.length, 'ponto medido', 'pontos medidos')}` : `${maior.valor > teto ? 'acima' : 'dentro'} do limite de ${numero(teto, 0)} dB`,
          };
        }),
        indicador('vagas', 'vagas', 0, (ls) => {
          const livres = ls.reduce((s, l) => s + l.valor, 0);
          const antes = ls.every((l) => l.anterior !== null) ? ls.reduce((s, l) => s + l.anterior!, 0) : null;
          return {
            valor: livres,
            variacao: antes !== null ? sinal(livres - antes, 0) : null,
            proporcao: null,
            nota: `livres em ${plural(ls.length, 'sensor', 'sensores')}`,
          };
        }),
      ],
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

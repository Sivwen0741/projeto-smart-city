import { classificarIqar, iqarDePm25 } from '../qualidade-ar/iqar';
import { IndicadorDto } from './dto/painel.dto';

export interface Leitura {
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

export const GRANDEZAS: Record<string, string[]> = {
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

const numero = (valor: number, casas: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(valor);
const sinal = (valor: number, casas: number) => `${valor > 0 ? '+' : valor < 0 ? '−' : ''}${numero(Math.abs(valor), casas)}`;
const media = (valores: number[]) => valores.reduce((s, v) => s + v, 0) / valores.length;
const limitar = (valor: number) => Math.max(0, Math.min(1, valor));
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
const nomeDoPonto = (l: Leitura) => (l.endereco ?? l.identificador).split(',')[0].trim();

export interface EntradaIndicadores {
  leituras: Leitura[];
  alertas: { grandeza: string; criticidade: string }[];
  limites: { grandeza: string; limite: number }[];
  mediasPm25: { dispositivoId: string; atual: number | null; anterior: number | null }[];
}

// cálculo puro dos seis indicadores da faixa (us12), a partir do que o serviço consulta
export function calcularIndicadores({ leituras, alertas, limites, mediasPm25 }: EntradaIndicadores): IndicadorDto[] {
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

  return [
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
  ];
}

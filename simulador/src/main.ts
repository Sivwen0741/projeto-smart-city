import { connectAsync } from 'mqtt';

// simulador próprio previsto na seção 7.2 do documento de visão; publica pelos dispositivos de exemplo
// da carga inicial. formato da mensagem em docs/decisoes/2026-10-24-ingestao-mqtt.md

type Gerador = (minuto: number) => number;

interface Simulado {
  codigo: string;
  leituras: Record<string, Gerador>;
}

const ruido = (amplitude: number) => (Math.random() * 2 - 1) * amplitude;
const arredondar = (valor: number, casas: number) => Number(valor.toFixed(casas));

// episódio que se repete a cada `ciclo` minutos, do minuto `inicio` ao minuto `fim` de cada ciclo
const emEpisodio = (minuto: number, ciclo: number, inicio: number, fim: number) => {
  const m = minuto % ciclo;
  return m >= inicio && m < fim;
};

// os episódios cruzam os limites das regras de exemplo para que os alertas apareçam ao vivo
const SIMULADOS: Simulado[] = [
  {
    // cheia do arroio a cada 40 min: passa da cota de 3,50 m por 15 min (regra grave de 10 min)
    codigo: 'SN-014',
    leituras: { nivel_agua: (t) => arredondar((emEpisodio(t, 40, 3, 18) ? 3.82 : 3.05) + ruido(0.08), 2) },
  },
  {
    // chuva forte no início de cada cheia (regra grave sem duração mínima)
    codigo: 'EA-02',
    leituras: {
      precipitacao: (t) => arredondar(emEpisodio(t, 40, 2, 5) ? 56 + ruido(4) : Math.max(0, 2 + ruido(2)), 1),
      temperatura: (t) => arredondar(21 + 3 * Math.sin((2 * Math.PI * t) / 240) + ruido(0.4), 1),
    },
  },
  {
    // episódio de poluição de 70 min a cada 3 h (regra de atenção de 60 min)
    codigo: 'EA-03',
    leituras: {
      pm25: (t) => arredondar((emEpisodio(t, 180, 20, 90) ? 61 : 38) + ruido(5), 1),
      pm10: (t) => arredondar((emEpisodio(t, 180, 20, 90) ? 88 : 55) + ruido(8), 1),
    },
  },
  {
    // ruído acima de 70 dB por 20 min a cada hora (regra de atenção de 15 min)
    codigo: 'SN-042',
    leituras: { nivel_sonoro: (t) => arredondar((emEpisodio(t, 60, 30, 50) ? 73 : 58) + ruido(3), 1) },
  },
  {
    // trânsito lento por 25 min a cada 2 h (regra de atenção de 20 min)
    codigo: 'SN-031',
    leituras: { velocidade_media: (t) => arredondar(emEpisodio(t, 120, 60, 85) ? 11 + ruido(2) : 34 + ruido(7), 0) },
  },
  {
    codigo: 'IL-118',
    leituras: { pontos_apagados: () => 9, consumo_energia: () => arredondar(3.1 + ruido(0.2), 2) },
  },
  { codigo: 'CAM-22', leituras: {} },
  { codigo: 'CAM-08', leituras: {} },
  { codigo: 'SF-105', leituras: {} },
  { codigo: 'SF-061', leituras: {} },
];

const url = process.env.MQTT_URL ?? 'mqtt://localhost:1883';
const intervalo = Number(process.env.SIMULADOR_INTERVALO_SEGUNDOS ?? 30) * 1000;
const cliente = await connectAsync(url, { clientId: `scoc-simulador-${process.pid}`, reconnectPeriod: 2000 });
const inicio = Date.now();
console.log(`simulador conectado a ${url}: ${SIMULADOS.length} dispositivos a cada ${intervalo / 1000} s`);

async function publicar(): Promise<void> {
  const minuto = (Date.now() - inicio) / 60_000;
  const dataHora = new Date().toISOString();
  for (const s of SIMULADOS) {
    const leituras = Object.entries(s.leituras).map(([grandeza, gerar]) => ({ grandeza, valor: gerar(minuto) }));
    await cliente.publishAsync(`scoc/dispositivos/${s.codigo}/leituras`, JSON.stringify({ dataHora, origem: 'simulador', leituras }), { qos: 1 });
  }
}

await publicar();
setInterval(() => publicar().catch((erro) => console.error(`falha ao publicar: ${erro.message}`)), intervalo);

for (const sinal of ['SIGTERM', 'SIGINT']) {
  process.on(sinal, () => cliente.endAsync().finally(() => process.exit(0)));
}

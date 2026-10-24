// variáveis monitoradas da seção 7.2 do documento de visão
export const GRANDEZAS = {
  nivel_agua: { rotulo: 'Nível de água', unidade: 'm' },
  precipitacao: { rotulo: 'Precipitação', unidade: 'mm' },
  vazao: { rotulo: 'Vazão fluvial', unidade: 'm³/s' },
  fluxo_veiculos: { rotulo: 'Fluxo de veículos', unidade: 'veículos/h' },
  velocidade_media: { rotulo: 'Velocidade média', unidade: 'km/h' },
  nivel_sonoro: { rotulo: 'Nível sonoro', unidade: 'dB' },
  pm25: { rotulo: 'PM2.5', unidade: 'µg/m³' },
  pm10: { rotulo: 'PM10', unidade: 'µg/m³' },
  temperatura: { rotulo: 'Temperatura do ar', unidade: '°C' },
  umidade: { rotulo: 'Umidade relativa', unidade: '%' },
  vagas_livres: { rotulo: 'Vagas livres', unidade: 'vagas' },
  consumo_energia: { rotulo: 'Consumo de energia', unidade: 'kWh' },
} as const;

export type Grandeza = keyof typeof GRANDEZAS;

export const CODIGOS_GRANDEZA = Object.keys(GRANDEZAS) as Grandeza[];

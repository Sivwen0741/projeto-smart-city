import { DataSource } from 'typeorm';

// intervalo de 30 s: "o sensor atualiza a cada trinta segundos" (design/00-identidade.svg) e painel de 05-dispositivos.svg
const TIPOS = [
  { nome: 'Sensor de nível', categoria: 'sensor_urbano', intervalo: 30 },
  { nome: 'Sensor de tráfego', categoria: 'sensor_urbano', intervalo: 30 },
  { nome: 'Sensor de ruído', categoria: 'sensor_urbano', intervalo: 30 },
  { nome: 'Sensor de vagas', categoria: 'sensor_urbano', intervalo: 30 },
  { nome: 'Câmera', categoria: 'camera_monitoramento', intervalo: 30 },
  { nome: 'Semáforo inteligente', categoria: 'semaforo_inteligente', intervalo: 30 },
  { nome: 'Estação ambiental', categoria: 'estacao_ambiental', intervalo: 30 },
  { nome: 'Controlador de iluminação', categoria: 'controlador_iluminacao', intervalo: 30 },
];

export async function carregarTiposDispositivo(fonte: DataSource): Promise<void> {
  for (const tipo of TIPOS) {
    await fonte.query(
      `INSERT INTO tipo_dispositivo (nome, categoria, intervalo_leitura_segundos) VALUES ($1, $2, $3)
       ON CONFLICT (nome) DO UPDATE
         SET categoria = EXCLUDED.categoria, intervalo_leitura_segundos = EXCLUDED.intervalo_leitura_segundos`,
      [tipo.nome, tipo.categoria, tipo.intervalo],
    );
  }
}

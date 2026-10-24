import { DataSource } from 'typeorm';

interface Exemplo {
  identificador: string;
  tipo: string;
  bairro: string;
  endereco: string;
  descricao: string;
  estado: 'ativo' | 'manutencao' | 'inativo';
  // segundos desde a última comunicação; nulo = nunca comunicou
  comunicacao: number | null;
  atributos: Record<string, unknown>;
}

// dispositivos de design/05-dispositivos.svg, nos bairros da camada do osm; ver docs/decisoes/2026-10-22-bairros-dos-exemplos.md
// e docs/decisoes/2026-10-22-dados-de-demonstracao.md
const EXEMPLOS: Exemplo[] = [
  { identificador: 'SN-014', tipo: 'Sensor de nível', bairro: 'Olarias', endereco: 'Arroio Olarias, ponte da Av. Visconde de Taunay', descricao: 'Nível do Arroio Olarias', estado: 'ativo', comunicacao: 8, atributos: { tipoGrandeza: 'nivel_agua', unidadeMedida: 'm', intervaloLeituraSegundos: 30 } },
  { identificador: 'EA-07', tipo: 'Estação ambiental', bairro: 'Chapada', endereco: 'Praça Marechal Floriano', descricao: 'Estação da Chapada', estado: 'ativo', comunicacao: 39 * 60, atributos: { variaveisMonitoradas: ['pm25', 'pm10', 'temperatura', 'umidade'] } },
  { identificador: 'CAM-22', tipo: 'Câmera', bairro: 'Órfãs', endereco: 'Av. Visconde de Taunay, 1840', descricao: 'Câmera da Av. Visconde de Taunay', estado: 'ativo', comunicacao: 3, atributos: { resolucao: '1920x1080', anguloVisao: 90 } },
  { identificador: 'SN-031', tipo: 'Sensor de tráfego', bairro: 'Oficinas', endereco: 'Av. Souza Naves, 2210', descricao: 'Velocidade média na Souza Naves', estado: 'ativo', comunicacao: 11, atributos: { tipoGrandeza: 'velocidade_media', unidadeMedida: 'km/h' } },
  { identificador: 'SF-105', tipo: 'Semáforo inteligente', bairro: 'Centro', endereco: 'Balduíno Taques com Sete de Setembro', descricao: 'Cruzamento central', estado: 'ativo', comunicacao: 5, atributos: { tempoCicloSegundos: 92 } },
  { identificador: 'EA-03', tipo: 'Estação ambiental', bairro: 'Cará-Cará', endereco: 'Rua Bento Ribeiro, 45', descricao: 'Estação da zona industrial', estado: 'ativo', comunicacao: 21, atributos: { variaveisMonitoradas: ['pm25', 'pm10'] } },
  { identificador: 'IL-118', tipo: 'Controlador de iluminação', bairro: 'Centro', endereco: 'Rua Balduíno Taques', descricao: 'Iluminação da Balduíno Taques', estado: 'manutencao', comunicacao: 2 * 60, atributos: { quantidadePontos: 9 } },
  { identificador: 'SN-042', tipo: 'Sensor de ruído', bairro: 'Centro', endereco: 'Rua Ermelino de Leão, 302', descricao: 'Ruído no calçadão', estado: 'ativo', comunicacao: 14, atributos: { tipoGrandeza: 'nivel_sonoro', unidadeMedida: 'dB' } },
  { identificador: 'CAM-08', tipo: 'Câmera', bairro: 'Uvaranas', endereco: 'Av. Carlos Cavalcanti, 4748', descricao: 'Câmera da Carlos Cavalcanti', estado: 'ativo', comunicacao: 6, atributos: { resolucao: '1920x1080' } },
  { identificador: 'SF-061', tipo: 'Semáforo inteligente', bairro: 'Nova Rússia', endereco: 'Av. Ernesto Vilela com Anita Garibaldi', descricao: 'Cruzamento da Ernesto Vilela', estado: 'ativo', comunicacao: 9, atributos: { tempoCicloSegundos: 78 } },
  { identificador: 'EA-02', tipo: 'Estação ambiental', bairro: 'Olarias', endereco: 'Parque Ambiental', descricao: 'Estação do Parque Ambiental', estado: 'ativo', comunicacao: 18, atributos: { variaveisMonitoradas: ['precipitacao', 'temperatura'] } },
  { identificador: 'SN-027', tipo: 'Sensor de nível', bairro: 'Ronda', endereco: 'Arroio Ronda, Rua Dr. Colares', descricao: 'Nível do Arroio Ronda', estado: 'ativo', comunicacao: null, atributos: { tipoGrandeza: 'nivel_agua', unidadeMedida: 'm' } },
  { identificador: 'SN-019', tipo: 'Sensor de nível', bairro: 'Neves', endereco: 'Arroio Pilão de Pedra', descricao: 'Retirado para substituição', estado: 'inativo', comunicacao: 41 * 24 * 60 * 60, atributos: { tipoGrandeza: 'nivel_agua', unidadeMedida: 'm' } },
];

export async function carregarDispositivosExemplo(fonte: DataSource): Promise<void> {
  let inseridos = 0;
  for (const [ordem, e] of EXEMPLOS.entries()) {
    // ponto sorteado dentro do bairro com semente fixa: a mesma coordenada em toda subida
    const resultado = await fonte.query(
      `INSERT INTO dispositivo
         (identificador, tipo_dispositivo_id, bairro_id, descricao, endereco, localizacao, estado,
          data_instalacao, ultima_comunicacao, atributos_especificos)
       SELECT $1::varchar, t.id, b.id, $3::varchar, $4::varchar,
              (ST_Dump(ST_GeneratePoints(b.area, 1, $5::int))).geom::geography, $6::varchar,
              DATE '2024-03-14', now() - $7::int * interval '1 second', $8::jsonb
         FROM tipo_dispositivo t, bairro b
        WHERE t.nome = $2::varchar AND b.nome = $9::varchar
          AND NOT EXISTS (SELECT 1 FROM dispositivo WHERE upper(identificador) = upper($1::varchar))
       RETURNING id`,
      [e.identificador, e.tipo, e.descricao, e.endereco, ordem + 1, e.estado, e.comunicacao, e.atributos, e.bairro],
    );
    inseridos += resultado.length;
  }
  if (inseridos > 0) console.log(`dispositivos de exemplo carregados: ${inseridos}`);
}

import { DataSource } from 'typeorm';

// órgãos de design/03-alertas.svg e 04-ocorrencia.svg; "Tecnologia" é o DTI da carga de acesso
const ORGAOS = [
  { nome: 'Defesa Civil', sigla: 'DC' },
  { nome: 'Mobilidade', sigla: 'MOB' },
  { nome: 'Meio Ambiente', sigla: 'SMMA' },
  { nome: 'Infraestrutura', sigla: 'INFRA' },
];

export async function carregarOrgaos(fonte: DataSource): Promise<void> {
  for (const o of ORGAOS) {
    await fonte.query(`INSERT INTO orgao (nome, sigla) VALUES ($1, $2) ON CONFLICT (sigla) DO NOTHING`, [o.nome, o.sigla]);
  }
}

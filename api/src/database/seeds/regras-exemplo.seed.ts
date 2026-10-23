import { DataSource } from 'typeorm';

// regras do desenho aprovado da tela de regras (us23); limites ilustrativos, ajustáveis pela interface
const EXEMPLOS = [
  { nome: 'Nível do arroio acima da cota', grandeza: 'nivel_agua', operador: '>', limite: 3.5, duracao: 10, criticidade: 'grave', ativa: true },
  { nome: 'Chuva forte acumulada', grandeza: 'precipitacao', operador: '>=', limite: 50, duracao: 0, criticidade: 'grave', ativa: true },
  { nome: 'Material particulado elevado', grandeza: 'pm25', operador: '>', limite: 55, duracao: 60, criticidade: 'atencao', ativa: true },
  { nome: 'Ruído noturno acima do permitido', grandeza: 'nivel_sonoro', operador: '>', limite: 70, duracao: 15, criticidade: 'atencao', ativa: true },
  { nome: 'Tráfego lento', grandeza: 'velocidade_media', operador: '<', limite: 15, duracao: 20, criticidade: 'atencao', ativa: true },
  { nome: 'Temperatura alta', grandeza: 'temperatura', operador: '>', limite: 35, duracao: 30, criticidade: 'informativo', ativa: false },
];

export async function carregarRegrasExemplo(fonte: DataSource): Promise<void> {
  let inseridas = 0;
  for (const r of EXEMPLOS) {
    const resultado = await fonte.query(
      `INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade, ativa)
       SELECT $1::varchar, $2, $3, $4, $5, $6, $7
        WHERE NOT EXISTS (SELECT 1 FROM regra_alerta WHERE nome = $1::varchar)
       RETURNING id`,
      [r.nome, r.grandeza, r.operador, r.limite, r.duracao, r.criticidade, r.ativa],
    );
    inseridas += resultado.length;
  }
  if (inseridas > 0) console.log(`regras de alerta de exemplo carregadas: ${inseridas}`);
}

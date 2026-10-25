import { MigrationInterface, QueryRunner } from 'typeorm';

export class RiscoDeEnchente1792454400010 implements MigrationInterface {
  name = 'RiscoDeEnchente1792454400010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // us10: a regra composta usa o limite principal como cota do nível e estes três campos para a condição complementar
    await queryRunner.query(`
      ALTER TABLE regra_alerta
        ADD COLUMN tipo                  varchar(20) NOT NULL DEFAULT 'simples' CHECK (tipo IN ('simples', 'risco_enchente')),
        ADD COLUMN limite_precipitacao   numeric CHECK (limite_precipitacao > 0),
        ADD COLUMN limite_vazao_prevista numeric CHECK (limite_vazao_prevista > 0),
        ADD COLUMN janela_horas          integer CHECK (janela_horas > 0),
        ADD CONSTRAINT regra_composta_ck CHECK (
          tipo = 'simples' OR (limite_precipitacao IS NOT NULL AND limite_vazao_prevista IS NOT NULL AND janela_horas IS NOT NULL))`);
    // as duas leituras que compõem o alerta (us10-2)
    await queryRunner.query(`ALTER TABLE alerta ADD COLUMN composicao jsonb`);
    await queryRunner.query(`
      INSERT INTO regra_alerta
        (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade, ativa, tipo, limite_precipitacao, limite_vazao_prevista, janela_horas)
      VALUES ('Risco de enchente', 'nivel_agua', '>', 3.5, 0, 'grave', true, 'risco_enchente', 50, 15, 24)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM alerta WHERE regra_alerta_id IN (SELECT id FROM regra_alerta WHERE tipo = 'risco_enchente')`);
    await queryRunner.query(`DELETE FROM regra_alerta WHERE tipo = 'risco_enchente'`);
    await queryRunner.query(`ALTER TABLE alerta DROP COLUMN composicao`);
    await queryRunner.query(`
      ALTER TABLE regra_alerta
        DROP CONSTRAINT regra_composta_ck,
        DROP COLUMN janela_horas,
        DROP COLUMN limite_vazao_prevista,
        DROP COLUMN limite_precipitacao,
        DROP COLUMN tipo`);
  }
}

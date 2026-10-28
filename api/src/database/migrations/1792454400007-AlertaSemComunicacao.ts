import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlertaSemComunicacao1792454400007 implements MigrationInterface {
  name = 'AlertaSemComunicacao1792454400007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // regra mantida pelo sistema (us07): não aparece na tela de regras e o limite vem de cada dispositivo
    await queryRunner.query(`ALTER TABLE regra_alerta ADD COLUMN sistema boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`
      INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade, ativa, sistema)
      VALUES ('Dispositivo sem comunicação', 'sem_comunicacao', '>', 0, 0, 'atencao', true, true)`);
    await queryRunner.query(`CREATE UNIQUE INDEX regra_alerta_sistema_uq ON regra_alerta (tipo_grandeza) WHERE sistema`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX regra_alerta_sistema_uq`);
    await queryRunner.query(`
      DELETE FROM alerta WHERE regra_alerta_id IN (SELECT id FROM regra_alerta WHERE sistema)`);
    await queryRunner.query(`DELETE FROM regra_alerta WHERE sistema`);
    await queryRunner.query(`ALTER TABLE regra_alerta DROP COLUMN sistema`);
  }
}

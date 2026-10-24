import { MigrationInterface, QueryRunner } from 'typeorm';

export class IngestaoEAlertas1792454400003 implements MigrationInterface {
  name = 'IngestaoEAlertas1792454400003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE alerta
        ADD CONSTRAINT alerta_situacao_ck CHECK (situacao IN ('aberto', 'em_atendimento', 'encerrado'))`);
    // um alerta ativo por regra e dispositivo, mesmo com leituras simultâneas
    await queryRunner.query(`
      CREATE UNIQUE INDEX alerta_ativo_uq ON alerta (regra_alerta_id, dispositivo_id)
       WHERE situacao IN ('aberto', 'em_atendimento')`);
    await queryRunner.query(`CREATE INDEX leitura_dispositivo_grandeza_data_hora_idx ON leitura (dispositivo_id, tipo_grandeza, data_hora)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX leitura_dispositivo_grandeza_data_hora_idx`);
    await queryRunner.query(`DROP INDEX alerta_ativo_uq`);
    await queryRunner.query(`ALTER TABLE alerta DROP CONSTRAINT alerta_situacao_ck`);
  }
}

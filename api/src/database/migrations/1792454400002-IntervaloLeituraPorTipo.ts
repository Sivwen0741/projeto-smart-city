import { MigrationInterface, QueryRunner } from 'typeorm';

export class IntervaloLeituraPorTipo1792454400002 implements MigrationInterface {
  name = 'IntervaloLeituraPorTipo1792454400002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tipo_dispositivo
        ADD COLUMN intervalo_leitura_segundos integer CHECK (intervalo_leitura_segundos > 0)`);
    await queryRunner.query(`CREATE INDEX dispositivo_bairro_idx ON dispositivo (bairro_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX dispositivo_bairro_idx`);
    await queryRunner.query(`ALTER TABLE tipo_dispositivo DROP COLUMN intervalo_leitura_segundos`);
  }
}

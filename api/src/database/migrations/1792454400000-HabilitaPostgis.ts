import { MigrationInterface, QueryRunner } from 'typeorm';

export class HabilitaPostgis1792454400000 implements MigrationInterface {
  name = 'HabilitaPostgis1792454400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis`);
  }
}

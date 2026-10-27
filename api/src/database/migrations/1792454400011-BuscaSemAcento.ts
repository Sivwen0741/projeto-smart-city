import { MigrationInterface, QueryRunner } from 'typeorm';

export class BuscaSemAcento1792454400011 implements MigrationInterface {
  name = 'BuscaSemAcento1792454400011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // us26-3: a busca não diferencia acentos
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS unaccent`);
  }
}

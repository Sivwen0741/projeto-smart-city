import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrigemDaComunicacao1792454400006 implements MigrationInterface {
  name = 'OrigemDaComunicacao1792454400006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // documento de visão, seção 9.2: o dado do simulador é identificado como tal na interface
    await queryRunner.query(`
      ALTER TABLE dispositivo
        ADD COLUMN origem_comunicacao varchar(20) CHECK (origem_comunicacao IN ('mqtt', 'simulador'))`);
    await queryRunner.query(`ALTER TABLE leitura ADD CONSTRAINT leitura_origem_ck CHECK (origem IN ('mqtt', 'simulador', 'open-meteo'))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE leitura DROP CONSTRAINT leitura_origem_ck`);
    await queryRunner.query(`ALTER TABLE dispositivo DROP COLUMN origem_comunicacao`);
  }
}

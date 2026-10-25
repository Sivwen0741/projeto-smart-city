import { MigrationInterface, QueryRunner } from 'typeorm';

export class EncerramentoDoAlerta1792454400004 implements MigrationInterface {
  name = 'EncerramentoDoAlerta1792454400004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE alerta ADD COLUMN data_encerramento timestamptz`);
    await queryRunner.query(`UPDATE alerta SET data_encerramento = data_hora WHERE situacao = 'encerrado'`);
    await queryRunner.query(`
      ALTER TABLE alerta
        ADD CONSTRAINT alerta_encerramento_ck CHECK ((situacao = 'encerrado') = (data_encerramento IS NOT NULL))`);
    await queryRunner.query(`CREATE INDEX alerta_data_hora_idx ON alerta (data_hora)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX alerta_data_hora_idx`);
    await queryRunner.query(`ALTER TABLE alerta DROP CONSTRAINT alerta_encerramento_ck`);
    await queryRunner.query(`ALTER TABLE alerta DROP COLUMN data_encerramento`);
  }
}

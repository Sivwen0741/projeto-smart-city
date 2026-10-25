import { MigrationInterface, QueryRunner } from 'typeorm';

export class OcorrenciaManual1792454400005 implements MigrationInterface {
  name = 'OcorrenciaManual1792454400005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ocorrencia
        ADD COLUMN endereco varchar(255),
        ADD COLUMN origem varchar(20) NOT NULL DEFAULT 'telefone' CHECK (origem IN ('telefone', 'alerta')),
        ADD CONSTRAINT ocorrencia_situacao_ck CHECK (situacao IN ('aberta', 'em_atendimento', 'encerrada')),
        ADD CONSTRAINT ocorrencia_criticidade_ck CHECK (criticidade IN ('grave', 'atencao', 'informativo'))`);
    // protocolo no formato do protótipo (2026-08-1147): ano, mês e uma sequência que não reinicia
    await queryRunner.query(`CREATE SEQUENCE ocorrencia_protocolo_seq START 1`);
    await queryRunner.query(`CREATE INDEX alerta_ocorrencia_idx ON alerta (ocorrencia_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX alerta_ocorrencia_idx`);
    await queryRunner.query(`DROP SEQUENCE ocorrencia_protocolo_seq`);
    await queryRunner.query(`
      ALTER TABLE ocorrencia
        DROP CONSTRAINT ocorrencia_criticidade_ck,
        DROP CONSTRAINT ocorrencia_situacao_ck,
        DROP COLUMN origem,
        DROP COLUMN endereco`);
  }
}

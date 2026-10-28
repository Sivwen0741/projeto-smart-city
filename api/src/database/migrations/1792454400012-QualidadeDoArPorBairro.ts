import { MigrationInterface, QueryRunner } from 'typeorm';

export class QualidadeDoArPorBairro1792454400012 implements MigrationInterface {
  name = 'QualidadeDoArPorBairro1792454400012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO fonte_dados (nome, url_base, licenca)
      VALUES ('Open-Meteo Air Quality API', 'https://air-quality-api.open-meteo.com/v1/air-quality', 'CC BY 4.0, dados CAMS do Copernicus')`);
    // us18: a qualidade do ar do open-meteo é do bairro, sem dispositivo; leitura e alerta passam a ter um dos dois
    await queryRunner.query(`
      ALTER TABLE leitura
        ALTER COLUMN dispositivo_id DROP NOT NULL,
        ADD COLUMN bairro_id bigint REFERENCES bairro (id),
        ADD CONSTRAINT leitura_alvo_ck CHECK (dispositivo_id IS NOT NULL OR bairro_id IS NOT NULL)`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX leitura_bairro_uq ON leitura (bairro_id, tipo_grandeza, data_hora, fonte_dados_id)
       WHERE bairro_id IS NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE alerta
        ALTER COLUMN dispositivo_id DROP NOT NULL,
        ADD COLUMN bairro_id bigint REFERENCES bairro (id),
        ADD CONSTRAINT alerta_alvo_ck CHECK (dispositivo_id IS NOT NULL OR bairro_id IS NOT NULL)`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX alerta_bairro_ativo_uq ON alerta (regra_alerta_id, bairro_id)
       WHERE situacao IN ('aberto', 'em_atendimento') AND bairro_id IS NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM alerta WHERE dispositivo_id IS NULL`);
    await queryRunner.query(`DROP INDEX alerta_bairro_ativo_uq`);
    await queryRunner.query(`ALTER TABLE alerta DROP CONSTRAINT alerta_alvo_ck, DROP COLUMN bairro_id, ALTER COLUMN dispositivo_id SET NOT NULL`);
    await queryRunner.query(`DELETE FROM leitura WHERE dispositivo_id IS NULL`);
    await queryRunner.query(`DROP INDEX leitura_bairro_uq`);
    await queryRunner.query(`ALTER TABLE leitura DROP CONSTRAINT leitura_alvo_ck, DROP COLUMN bairro_id, ALTER COLUMN dispositivo_id SET NOT NULL`);
    await queryRunner.query(`DELETE FROM fonte_dados WHERE nome = 'Open-Meteo Air Quality API'`);
  }
}

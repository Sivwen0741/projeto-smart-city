import { MigrationInterface, QueryRunner } from 'typeorm';

export class ColetaOpenMeteo1792454400009 implements MigrationInterface {
  name = 'ColetaOpenMeteo1792454400009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // us09-4: a tela mostra a última coleta boa e avisa quando a seguinte falhou
    await queryRunner.query(`
      ALTER TABLE fonte_dados
        ADD COLUMN ultima_tentativa timestamptz,
        ADD COLUMN ultimo_erro      text`);
    await queryRunner.query(`
      INSERT INTO fonte_dados (nome, url_base, licenca)
      VALUES ('Open-Meteo Flood API', 'https://flood-api.open-meteo.com/v1/flood', 'CC BY 4.0, dados GloFAS do Copernicus')`);
    // a coleta repete os dias já gravados; o índice deixa regravar o mesmo dia sem duplicar
    await queryRunner.query(`
      CREATE UNIQUE INDEX leitura_externa_uq ON leitura (dispositivo_id, tipo_grandeza, data_hora, fonte_dados_id)
       WHERE fonte_dados_id IS NOT NULL`);
    // previsão fica fora de leitura para nunca virar a última leitura de um dispositivo
    await queryRunner.query(`
      CREATE TABLE previsao (
        dispositivo_id bigint      NOT NULL REFERENCES dispositivo (id),
        fonte_dados_id bigint      NOT NULL REFERENCES fonte_dados (id),
        tipo_grandeza  varchar(60) NOT NULL,
        data           date        NOT NULL,
        valor          numeric     NOT NULL,
        coletada_em    timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (dispositivo_id, fonte_dados_id, tipo_grandeza, data)
      )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE previsao`);
    await queryRunner.query(`DROP INDEX leitura_externa_uq`);
    await queryRunner.query(`
      DELETE FROM leitura WHERE fonte_dados_id IN (SELECT id FROM fonte_dados WHERE nome = 'Open-Meteo Flood API')`);
    await queryRunner.query(`DELETE FROM fonte_dados WHERE nome = 'Open-Meteo Flood API'`);
    await queryRunner.query(`ALTER TABLE fonte_dados DROP COLUMN ultimo_erro, DROP COLUMN ultima_tentativa`);
  }
}

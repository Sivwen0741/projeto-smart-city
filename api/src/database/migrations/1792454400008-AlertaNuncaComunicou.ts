import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlertaNuncaComunicou1792454400008 implements MigrationInterface {
  name = 'AlertaNuncaComunicou1792454400008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // sem valor = dispositivo que nunca se comunicou (us07); alerta disparado por leitura sempre tem valor
    await queryRunner.query(`ALTER TABLE alerta ALTER COLUMN valor_observado DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE alerta ADD CONSTRAINT alerta_valor_ck CHECK (valor_observado IS NOT NULL OR leitura_id IS NULL)`);
    await queryRunner.query(`
      UPDATE alerta a SET valor_observado = NULL
        FROM regra_alerta r, dispositivo d
       WHERE r.id = a.regra_alerta_id AND r.sistema AND d.id = a.dispositivo_id AND d.ultima_comunicacao IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE alerta SET valor_observado = 0 WHERE valor_observado IS NULL`);
    await queryRunner.query(`ALTER TABLE alerta DROP CONSTRAINT alerta_valor_ck`);
    await queryRunner.query(`ALTER TABLE alerta ALTER COLUMN valor_observado SET NOT NULL`);
  }
}

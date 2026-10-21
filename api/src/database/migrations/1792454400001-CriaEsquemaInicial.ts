import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema do diagrama entidade-relacionamento (docs/diagrama-der.drawio), com os
 * ajustes registrados em docs/decisoes/2026-10-20-ajustes-der-sprint-4.md.
 */
export class CriaEsquemaInicial1792454400001 implements MigrationInterface {
  name = 'CriaEsquemaInicial1792454400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Controle de acesso
    await queryRunner.query(`
      CREATE TABLE orgao (
        id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nome          varchar(120) NOT NULL,
        sigla         varchar(20)  NOT NULL UNIQUE,
        email_contato varchar(160)
      )`);
    await queryRunner.query(`
      CREATE TABLE perfil (
        id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nome      varchar(60) NOT NULL UNIQUE,
        descricao varchar(255)
      )`);
    await queryRunner.query(`
      CREATE TABLE permissao (
        id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        codigo    varchar(60) NOT NULL UNIQUE,
        descricao varchar(255)
      )`);
    await queryRunner.query(`
      CREATE TABLE perfil_permissao (
        perfil_id    bigint NOT NULL REFERENCES perfil (id),
        permissao_id bigint NOT NULL REFERENCES permissao (id),
        PRIMARY KEY (perfil_id, permissao_id)
      )`);
    await queryRunner.query(`
      CREATE TABLE usuario (
        id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        orgao_id      bigint       NOT NULL REFERENCES orgao (id),
        perfil_id     bigint       NOT NULL REFERENCES perfil (id),
        nome          varchar(120) NOT NULL,
        email         varchar(160) NOT NULL,
        senha_hash    varchar(255) NOT NULL,
        ativo         boolean      NOT NULL DEFAULT true,
        ultimo_acesso timestamptz
      )`);
    await queryRunner.query(`CREATE UNIQUE INDEX usuario_email_uq ON usuario (lower(email))`);

    // usuario_id nulo registra tentativa de acesso com e-mail que não existe na base
    await queryRunner.query(`
      CREATE TABLE log_atividade (
        id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        usuario_id       bigint REFERENCES usuario (id),
        acao             varchar(60)  NOT NULL,
        entidade_afetada varchar(60),
        entidade_id      bigint,
        detalhes         jsonb,
        endereco_ip      varchar(45),
        data_hora        timestamptz  NOT NULL DEFAULT now()
      )`);
    await queryRunner.query(`CREATE INDEX log_atividade_data_hora_idx ON log_atividade (data_hora)`);
    await queryRunner.query(`CREATE INDEX log_atividade_entidade_idx ON log_atividade (entidade_afetada, entidade_id)`);

    // Território
    await queryRunner.query(`
      CREATE TABLE distrito (
        id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nome        varchar(120) NOT NULL,
        codigo_ibge varchar(9)   NOT NULL UNIQUE,
        area        geometry(MultiPolygon, 4326) NOT NULL
      )`);
    await queryRunner.query(`CREATE INDEX distrito_area_idx ON distrito USING gist (area)`);
    await queryRunner.query(`
      CREATE TABLE bairro (
        id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        distrito_id        bigint       NOT NULL REFERENCES distrito (id),
        nome               varchar(120) NOT NULL,
        codigo_ibge        varchar(20),
        osm_id             bigint       NOT NULL UNIQUE,
        area               geometry(MultiPolygon, 4326) NOT NULL,
        populacao_estimada integer
      )`);
    await queryRunner.query(`CREATE INDEX bairro_area_idx ON bairro USING gist (area)`);

    // Dispositivos e leituras
    await queryRunner.query(`
      CREATE TABLE tipo_dispositivo (
        id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nome      varchar(80) NOT NULL UNIQUE,
        categoria varchar(60) NOT NULL,
        descricao varchar(255)
      )`);
    await queryRunner.query(`
      CREATE TABLE dispositivo (
        id                    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        bairro_id             bigint REFERENCES bairro (id),
        tipo_dispositivo_id   bigint      NOT NULL REFERENCES tipo_dispositivo (id),
        identificador         varchar(40) NOT NULL,
        descricao             varchar(255),
        endereco              varchar(255),
        localizacao           geography(Point, 4326) NOT NULL,
        estado                varchar(20) NOT NULL DEFAULT 'ativo'
                              CHECK (estado IN ('ativo', 'manutencao', 'inativo')),
        data_instalacao       date,
        ultima_comunicacao    timestamptz,
        atributos_especificos jsonb       NOT NULL DEFAULT '{}'::jsonb
      )`);
    await queryRunner.query(`CREATE UNIQUE INDEX dispositivo_identificador_uq ON dispositivo (upper(identificador))`);
    await queryRunner.query(`CREATE INDEX dispositivo_localizacao_idx ON dispositivo USING gist (localizacao)`);
    await queryRunner.query(`
      CREATE TABLE fonte_dados (
        id                     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nome                   varchar(80) NOT NULL UNIQUE,
        url_base               varchar(255),
        licenca                varchar(120),
        limite_requisicoes_dia integer,
        ultima_coleta          timestamptz
      )`);
    await queryRunner.query(`
      CREATE TABLE leitura (
        id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        dispositivo_id bigint        NOT NULL REFERENCES dispositivo (id),
        fonte_dados_id bigint REFERENCES fonte_dados (id),
        tipo_grandeza  varchar(60)   NOT NULL,
        valor          numeric       NOT NULL,
        unidade        varchar(20),
        origem         varchar(20)   NOT NULL,
        data_hora      timestamptz   NOT NULL
      )`);
    await queryRunner.query(`CREATE INDEX leitura_dispositivo_data_hora_idx ON leitura (dispositivo_id, data_hora)`);

    // Motor de alertas
    await queryRunner.query(`
      CREATE TABLE regra_alerta (
        id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nome             varchar(120) NOT NULL,
        tipo_grandeza    varchar(60)  NOT NULL,
        operador         varchar(2)   NOT NULL CHECK (operador IN ('>', '>=', '<', '<=', '=', '<>')),
        valor_limite     numeric      NOT NULL,
        duracao_minutos  integer      NOT NULL CHECK (duracao_minutos >= 0),
        criticidade      varchar(20)  NOT NULL CHECK (criticidade IN ('grave', 'atencao', 'informativo')),
        ativa            boolean      NOT NULL DEFAULT true
      )`);

    // Ocorrências
    await queryRunner.query(`
      CREATE TABLE ocorrencia (
        id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        bairro_id           bigint REFERENCES bairro (id),
        orgao_id            bigint REFERENCES orgao (id),
        usuario_abertura_id bigint REFERENCES usuario (id),
        protocolo           varchar(20) NOT NULL UNIQUE,
        categoria           varchar(60) NOT NULL,
        descricao           text,
        localizacao         geography(Point, 4326),
        criticidade         varchar(20) NOT NULL,
        situacao            varchar(30) NOT NULL,
        data_abertura       timestamptz NOT NULL DEFAULT now(),
        data_encerramento   timestamptz
      )`);
    await queryRunner.query(`CREATE INDEX ocorrencia_localizacao_idx ON ocorrencia USING gist (localizacao)`);
    await queryRunner.query(`
      CREATE TABLE historico_ocorrencia (
        id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        ocorrencia_id     bigint      NOT NULL REFERENCES ocorrencia (id),
        usuario_id        bigint REFERENCES usuario (id),
        situacao_anterior varchar(30),
        situacao_nova     varchar(30) NOT NULL,
        observacao        text,
        data_hora         timestamptz NOT NULL DEFAULT now()
      )`);

    // operador e valor_limite copiados da regra no disparo: editar a regra não altera o alerta já emitido
    await queryRunner.query(`
      CREATE TABLE alerta (
        id                        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        regra_alerta_id           bigint      NOT NULL REFERENCES regra_alerta (id),
        dispositivo_id            bigint      NOT NULL REFERENCES dispositivo (id),
        leitura_id                bigint REFERENCES leitura (id),
        ocorrencia_id             bigint REFERENCES ocorrencia (id),
        usuario_reconhecimento_id bigint REFERENCES usuario (id),
        valor_observado           numeric     NOT NULL,
        operador                  varchar(2)  NOT NULL,
        valor_limite              numeric     NOT NULL,
        criticidade               varchar(20) NOT NULL,
        situacao                  varchar(30) NOT NULL,
        providencia               text,
        data_hora                 timestamptz NOT NULL DEFAULT now(),
        data_reconhecimento       timestamptz
      )`);
    await queryRunner.query(`CREATE INDEX alerta_regra_idx ON alerta (regra_alerta_id)`);

    await queryRunner.query(`
      CREATE TABLE relatorio (
        id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        usuario_id      bigint       NOT NULL REFERENCES usuario (id),
        titulo          varchar(160) NOT NULL,
        periodo_inicio  date         NOT NULL,
        periodo_fim     date         NOT NULL,
        caminho_arquivo varchar(255),
        data_geracao    timestamptz  NOT NULL DEFAULT now()
      )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const tabela of [
      'relatorio', 'alerta', 'historico_ocorrencia', 'ocorrencia', 'regra_alerta',
      'leitura', 'fonte_dados', 'dispositivo', 'tipo_dispositivo', 'bairro', 'distrito',
      'log_atividade', 'usuario', 'perfil_permissao', 'permissao', 'perfil', 'orgao',
    ]) {
      await queryRunner.query(`DROP TABLE ${tabela}`);
    }
  }
}

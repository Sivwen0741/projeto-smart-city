import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { readdirSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configurar } from '../src/configurar';
import { opcoesBanco } from '../src/database/data-source';
import { preparar } from '../src/database/preparar';

// 1792454400001-CriaEsquemaInicial.ts vira CriaEsquemaInicial1792454400001
const MIGRACOES_VERSIONADAS = readdirSync(join(__dirname, '../src/database/migrations'))
  .filter((arquivo) => arquivo.endsWith('.ts'))
  .sort()
  .map((arquivo) => {
    const [marca, nome] = arquivo.replace(/\.ts$/, '').split('-');
    return `${nome}${marca}`;
  });

const TABELAS_DO_DER = [
  'orgao', 'perfil', 'permissao', 'perfil_permissao', 'usuario', 'log_atividade', 'distrito',
  'bairro', 'tipo_dispositivo', 'dispositivo', 'fonte_dados', 'leitura', 'regra_alerta',
  'ocorrencia', 'historico_ocorrencia', 'alerta', 'relatorio',
];

describe('TT01 - Subir o ambiente de desenvolvimento com Docker Compose', () => {
  let fonte: DataSource;
  let app: INestApplication;

  beforeAll(async () => {
    fonte = await new DataSource(opcoesBanco()).initialize();
    await preparar(fonte);
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    configurar(app);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await fonte?.destroy();
  });

  it('TT01-1 a interface de programação responde com o banco PostGIS habilitado', async () => {
    const resposta = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(resposta.body.situacao).toBe('ok');
    expect(resposta.body.postgis).toMatch(/^3\./);
  });

  it('TT01-2 o esquema é criado por migração versionada', async () => {
    const migracoes = await fonte.query(`SELECT name FROM migracao ORDER BY id`);
    expect(MIGRACOES_VERSIONADAS.slice(0, 2)).toEqual(['HabilitaPostgis1792454400000', 'CriaEsquemaInicial1792454400001']);
    expect(migracoes.map((m: { name: string }) => m.name)).toEqual(MIGRACOES_VERSIONADAS);
    const tabelas = await fonte.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
    );
    const nomes = tabelas.map((t: { table_name: string }) => t.table_name);
    expect(nomes).toEqual(expect.arrayContaining(TABELAS_DO_DER));
  });

  it('TT01-2 uma nova subida não reaplica migrações nem duplica a carga', async () => {
    await preparar(fonte);
    const [{ migracoes, bairros }] = await fonte.query(
      `SELECT (SELECT count(*) FROM migracao)::int AS migracoes, (SELECT count(*) FROM bairro)::int AS bairros`,
    );
    expect(migracoes).toBe(MIGRACOES_VERSIONADAS.length);
    expect(bairros).toBe(16);
  });

  it('TT01-3 os distritos de Ponta Grossa vêm com o código da API de Localidades do IBGE', async () => {
    const distritos = await fonte.query(`SELECT codigo_ibge, nome FROM distrito ORDER BY codigo_ibge`);
    expect(distritos).toEqual([
      { codigo_ibge: '411990505', nome: 'Ponta Grossa' },
      { codigo_ibge: '411990510', nome: 'Guaragi' },
      { codigo_ibge: '411990515', nome: 'Itaiacoca' },
      { codigo_ibge: '411990517', nome: 'Piriquitos' },
      { codigo_ibge: '411990525', nome: 'Uvaia' },
    ]);
  });

  it('TT01-3 os dezesseis bairros do OpenStreetMap estão carregados, cada um dentro de um distrito', async () => {
    const [{ total, validos, sem_distrito }] = await fonte.query(`
      SELECT count(*)::int AS total,
             count(*) FILTER (WHERE ST_IsValid(area))::int AS validos,
             count(*) FILTER (WHERE distrito_id IS NULL)::int AS sem_distrito
        FROM bairro`);
    expect({ total, validos, sem_distrito }).toEqual({ total: 16, validos: 16, sem_distrito: 0 });
  });

  it('TT01-3 a consulta espacial resolve o bairro de um ponto', async () => {
    // praça marechal floriano peixoto
    const [bairro] = await fonte.query(
      `SELECT b.nome, d.nome AS distrito FROM bairro b JOIN distrito d ON d.id = b.distrito_id
        WHERE ST_Contains(b.area, ST_SetSRID(ST_MakePoint(-50.1619, -25.0950), 4326))`,
    );
    expect(bairro).toEqual({ nome: 'Centro', distrito: 'Ponta Grossa' });
  });
});

import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ${nome} não definida`);
  return valor;
}

export function opcoesBanco(): DataSourceOptions {
  return {
    type: 'postgres',
    host: obrigatoria('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 5432),
    database: obrigatoria('DB_NAME'),
    username: obrigatoria('DB_USER'),
    password: obrigatoria('DB_PASSWORD'),
    migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
    migrationsTableName: 'migracao',
    synchronize: false,
  };
}

export default new DataSource(opcoesBanco());

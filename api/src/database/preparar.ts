import { DataSource } from 'typeorm';
import { opcoesBanco } from './data-source';
import { carregarTerritorio } from './seeds/territorio.seed';

/** Executado na subida do contêiner, antes da API: aplica as migrações pendentes e a carga inicial. */
export async function preparar(fonte: DataSource): Promise<void> {
  const aplicadas = await fonte.runMigrations({ transaction: 'each' });
  for (const m of aplicadas) console.log(`migração aplicada: ${m.name}`);
  await carregarTerritorio(fonte);
}

if (require.main === module) {
  const fonte = new DataSource(opcoesBanco());
  fonte
    .initialize()
    .then(() => preparar(fonte))
    .then(() => fonte.destroy())
    .catch((erro) => {
      console.error(erro);
      process.exit(1);
    });
}

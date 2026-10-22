import { DataSource } from 'typeorm';
import { opcoesBanco } from './data-source';
import { carregarAcesso } from './seeds/acesso.seed';
import { carregarTerritorio } from './seeds/territorio.seed';
import { carregarTiposDispositivo } from './seeds/tipos-dispositivo.seed';

export async function preparar(fonte: DataSource): Promise<void> {
  const aplicadas = await fonte.runMigrations({ transaction: 'each' });
  for (const m of aplicadas) console.log(`migração aplicada: ${m.name}`);
  await carregarTerritorio(fonte);
  await carregarAcesso(fonte);
  await carregarTiposDispositivo(fonte);
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

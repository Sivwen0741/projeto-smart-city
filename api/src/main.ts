import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configurar } from './configurar';

async function iniciar() {
  const app = await NestFactory.create(AppModule);
  configurar(app);
  await app.listen(Number(process.env.API_PORT ?? 3000));
}

iniciar();

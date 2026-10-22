import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { opcoesBanco } from './database/data-source';
import { DispositivosModule } from './dispositivos/dispositivos.module';
import { HealthController } from './health/health.controller';
import { RegrasAlertaModule } from './regras-alerta/regras-alerta.module';

@Module({
  imports: [TypeOrmModule.forRootAsync({ useFactory: () => ({ ...opcoesBanco(), autoLoadEntities: true }) }), AuthModule, DispositivosModule, RegrasAlertaModule],
  controllers: [HealthController],
})
export class AppModule {}

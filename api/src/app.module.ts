import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertasModule } from './alertas/alertas.module';
import { AuthModule } from './auth/auth.module';
import { opcoesBanco } from './database/data-source';
import { DispositivosModule } from './dispositivos/dispositivos.module';
import { HealthController } from './health/health.controller';
import { IngestaoModule } from './ingestao/ingestao.module';
import { OcorrenciasModule } from './ocorrencias/ocorrencias.module';
import { PainelModule } from './painel/painel.module';
import { RegrasAlertaModule } from './regras-alerta/regras-alerta.module';
import { RiosModule } from './rios/rios.module';
import { TempoRealModule } from './tempo-real/tempo-real.module';

@Module({
  imports: [TypeOrmModule.forRootAsync({ useFactory: () => ({ ...opcoesBanco(), autoLoadEntities: true }) }), AuthModule, DispositivosModule, RegrasAlertaModule, AlertasModule, IngestaoModule, OcorrenciasModule, PainelModule, RiosModule, TempoRealModule],
  controllers: [HealthController],
})
export class AppModule {}

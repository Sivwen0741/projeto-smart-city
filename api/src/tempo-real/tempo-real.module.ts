import { Module } from '@nestjs/common';
import { AlertasModule } from '../alertas/alertas.module';
import { AuthModule } from '../auth/auth.module';
import { IngestaoModule } from '../ingestao/ingestao.module';
import { OcorrenciasModule } from '../ocorrencias/ocorrencias.module';
import { RiosModule } from '../rios/rios.module';
import { TempoRealGateway } from './tempo-real.gateway';

@Module({
  imports: [AuthModule, AlertasModule, IngestaoModule, OcorrenciasModule, RiosModule],
  providers: [TempoRealGateway],
})
export class TempoRealModule {}

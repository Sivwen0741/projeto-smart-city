import { Module } from '@nestjs/common';
import { AlertasModule } from '../alertas/alertas.module';
import { AuthModule } from '../auth/auth.module';
import { OcorrenciasModule } from '../ocorrencias/ocorrencias.module';
import { TempoRealGateway } from './tempo-real.gateway';

@Module({
  imports: [AuthModule, AlertasModule, OcorrenciasModule],
  providers: [TempoRealGateway],
})
export class TempoRealModule {}

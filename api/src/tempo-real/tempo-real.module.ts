import { Module } from '@nestjs/common';
import { AlertasModule } from '../alertas/alertas.module';
import { AuthModule } from '../auth/auth.module';
import { TempoRealGateway } from './tempo-real.gateway';

@Module({
  imports: [AuthModule, AlertasModule],
  providers: [TempoRealGateway],
})
export class TempoRealModule {}

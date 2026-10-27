import { Module } from '@nestjs/common';
import { AlertasModule } from '../alertas/alertas.module';
import { ColetaQualidadeArService } from './coleta-qualidade-ar.service';

@Module({
  imports: [AlertasModule],
  providers: [ColetaQualidadeArService],
  exports: [ColetaQualidadeArService],
})
export class QualidadeArModule {}

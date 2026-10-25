import { Module } from '@nestjs/common';
import { AlertasModule } from '../alertas/alertas.module';
import { DispositivosModule } from '../dispositivos/dispositivos.module';
import { LogAtividadeModule } from '../log-atividade/log-atividade.module';
import { OcorrenciasController } from './ocorrencias.controller';
import { OcorrenciasService } from './ocorrencias.service';

@Module({
  imports: [AlertasModule, DispositivosModule, LogAtividadeModule],
  controllers: [OcorrenciasController],
  providers: [OcorrenciasService],
  exports: [OcorrenciasService],
})
export class OcorrenciasModule {}

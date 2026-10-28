import { Module } from '@nestjs/common';
import { LogAtividadeModule } from '../log-atividade/log-atividade.module';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';
import { EventosAlertasService } from './eventos-alertas.service';
import { MotorAlertasService } from './motor-alertas.service';
import { VerificacaoComunicacaoService } from './verificacao-comunicacao.service';

@Module({
  imports: [LogAtividadeModule],
  controllers: [AlertasController],
  providers: [AlertasService, MotorAlertasService, EventosAlertasService, VerificacaoComunicacaoService],
  exports: [MotorAlertasService, EventosAlertasService, VerificacaoComunicacaoService],
})
export class AlertasModule {}

import { Module } from '@nestjs/common';
import { MotorAlertasService } from './motor-alertas.service';

@Module({
  providers: [MotorAlertasService],
  exports: [MotorAlertasService],
})
export class AlertasModule {}

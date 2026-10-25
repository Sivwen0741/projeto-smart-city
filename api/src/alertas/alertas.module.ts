import { Module } from '@nestjs/common';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';
import { MotorAlertasService } from './motor-alertas.service';

@Module({
  controllers: [AlertasController],
  providers: [AlertasService, MotorAlertasService],
  exports: [MotorAlertasService],
})
export class AlertasModule {}

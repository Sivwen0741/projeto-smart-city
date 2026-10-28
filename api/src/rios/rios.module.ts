import { Module } from '@nestjs/common';
import { ColetaOpenMeteoService } from './coleta-open-meteo.service';
import { RiosController } from './rios.controller';
import { RiosService } from './rios.service';

@Module({
  controllers: [RiosController],
  providers: [RiosService, ColetaOpenMeteoService],
  exports: [ColetaOpenMeteoService],
})
export class RiosModule {}

import { Module } from '@nestjs/common';
import { LogAtividadeModule } from '../log-atividade/log-atividade.module';
import { RegrasAlertaController } from './regras-alerta.controller';
import { RegrasAlertaService } from './regras-alerta.service';

@Module({
  imports: [LogAtividadeModule],
  controllers: [RegrasAlertaController],
  providers: [RegrasAlertaService],
})
export class RegrasAlertaModule {}

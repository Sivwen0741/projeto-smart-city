import { Module } from '@nestjs/common';
import { LogAtividadeModule } from '../log-atividade/log-atividade.module';
import { DispositivosController } from './dispositivos.controller';
import { DispositivosService } from './dispositivos.service';

@Module({
  imports: [LogAtividadeModule],
  controllers: [DispositivosController],
  providers: [DispositivosService],
  exports: [DispositivosService],
})
export class DispositivosModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogAtividade } from './log-atividade.entity';
import { LogAtividadeService } from './log-atividade.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogAtividade])],
  providers: [LogAtividadeService],
  exports: [LogAtividadeService],
})
export class LogAtividadeModule {}

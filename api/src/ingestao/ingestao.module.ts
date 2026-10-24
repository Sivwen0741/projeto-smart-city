import { Module } from '@nestjs/common';
import { AlertasModule } from '../alertas/alertas.module';
import { IngestaoService } from './ingestao.service';

@Module({
  imports: [AlertasModule],
  providers: [IngestaoService],
})
export class IngestaoModule {}

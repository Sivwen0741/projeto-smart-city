import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { opcoesBanco } from './database/data-source';
import { HealthController } from './health/health.controller';

@Module({
  imports: [TypeOrmModule.forRootAsync({ useFactory: () => ({ ...opcoesBanco(), autoLoadEntities: true }) })],
  controllers: [HealthController],
})
export class AppModule {}

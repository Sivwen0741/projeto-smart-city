import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('saúde')
@Controller('health')
export class HealthController {
  constructor(private readonly fonte: DataSource) {}

  @Get()
  @ApiOkResponse({ description: 'A interface de programação e o banco estão respondendo' })
  async verificar() {
    const [{ postgis }] = await this.fonte.query(`SELECT postgis_lib_version() AS postgis`);
    return { situacao: 'ok', postgis };
  }
}

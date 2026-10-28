import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RiosDto } from './dto/rios.dto';
import { RiosService } from './rios.service';

@ApiTags('rios')
@ApiBearerAuth()
@Controller('rios')
export class RiosController {
  constructor(private readonly rios: RiosService) {}

  @Get()
  @ApiOperation({ summary: 'Pontos monitorados dos arroios: nível dos sensores, tendência, cota e vazão do Open-Meteo' })
  @ApiOkResponse({ type: RiosDto })
  consultar(): Promise<RiosDto> {
    return this.rios.consultar();
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PainelDto } from './dto/painel.dto';
import { PainelService } from './painel.service';

@ApiTags('painel')
@ApiBearerAuth()
@Controller('painel')
export class PainelController {
  constructor(private readonly painel: PainelService) {}

  @Get()
  @ApiOperation({ summary: 'Indicadores da faixa do painel e os dois gráficos de ocorrências (02-painel.svg)' })
  @ApiOkResponse({ type: PainelDto })
  consultar(): Promise<PainelDto> {
    return this.painel.consultar();
  }
}

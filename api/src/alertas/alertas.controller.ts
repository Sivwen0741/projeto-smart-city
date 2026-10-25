import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlertasService } from './alertas.service';
import { AlertaDto, ListarAlertasDto, ResumoAlertasDto } from './dto/alerta.dto';

@ApiTags('alertas')
@ApiBearerAuth()
@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertas: AlertasService) {}

  @Get()
  @ApiOperation({ summary: 'Alertas da visão pedida, do mais grave ao menos grave e, na mesma gravidade, do mais recente' })
  @ApiOkResponse({ type: [AlertaDto] })
  listar(@Query() { visao }: ListarAlertasDto): Promise<AlertaDto[]> {
    return this.alertas.listar(visao);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Indicadores do topo da tela de alertas' })
  @ApiOkResponse({ type: ResumoAlertasDto })
  resumo(): Promise<ResumoAlertasDto> {
    return this.alertas.resumo();
  }
}

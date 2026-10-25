import { Body, Controller, Get, HttpCode, Ip, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import { Usuario } from '../usuarios/usuario.entity';
import { AlertasService } from './alertas.service';
import { AlertaDto, ListarAlertasDto, ReconhecerAlertaDto, ResumoAlertasDto } from './dto/alerta.dto';
import { EventosAlertasService } from './eventos-alertas.service';

@ApiTags('alertas')
@ApiBearerAuth()
@Controller('alertas')
export class AlertasController {
  constructor(
    private readonly alertas: AlertasService,
    private readonly eventos: EventosAlertasService,
  ) {}

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

  @Post(':id/reconhecimento')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reconhece o alerta e registra a providência; só um operador reconhece cada alerta' })
  @ApiOkResponse({ type: AlertaDto })
  @ApiBadRequestResponse({ description: 'Providência vazia' })
  @ApiNotFoundResponse()
  @ApiConflictResponse({ description: 'Já reconhecido ou encerrado; o corpo traz o alerta como está' })
  async reconhecer(
    @Param('id') id: string,
    @Body() { providencia }: ReconhecerAlertaDto,
    @UsuarioAtual() usuario: Usuario,
    @Ip() ip: string,
  ): Promise<AlertaDto> {
    const alerta = await this.alertas.reconhecer(id, providencia, { usuarioId: usuario.id, enderecoIp: ip ?? null });
    await this.eventos.atualizado(alerta.id);
    return alerta;
  }
}

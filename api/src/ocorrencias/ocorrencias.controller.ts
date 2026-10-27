import { Body, Controller, Get, HttpCode, Ip, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import { EventosAlertasService } from '../alertas/eventos-alertas.service';
import { Usuario } from '../usuarios/usuario.entity';
import { CATEGORIAS_OCORRENCIA } from './categorias';
import {
  AtualizarOcorrenciaDto,
  CriarOcorrenciaDto,
  DetalheOcorrenciaDto,
  ListarOcorrenciasDto,
  OcorrenciaDto,
  OrgaoDto,
} from './dto/ocorrencia.dto';
import { OcorrenciasService } from './ocorrencias.service';

@ApiTags('ocorrências')
@ApiBearerAuth()
@Controller()
export class OcorrenciasController {
  constructor(
    private readonly ocorrencias: OcorrenciasService,
    private readonly eventosAlertas: EventosAlertasService,
  ) {}

  @Get('ocorrencias')
  @ApiOperation({
    summary: 'Ocorrências da visão pedida; em andamento, as abertas antes das em atendimento, depois por gravidade e da mais antiga',
  })
  @ApiOkResponse({ type: [OcorrenciaDto] })
  listar(@Query() { visao }: ListarOcorrenciasDto): Promise<OcorrenciaDto[]> {
    return this.ocorrencias.listar(visao);
  }

  @Post('ocorrencias')
  @ApiOperation({ summary: 'Registra uma ocorrência informada por telefone ou aberta a partir de um alerta' })
  @ApiCreatedResponse({ type: OcorrenciaDto })
  @ApiBadRequestResponse({ description: 'Sem categoria, sem gravidade, sem localização ou com órgão inválido' })
  @ApiUnprocessableEntityResponse({ description: 'Coordenada fora do município' })
  @ApiConflictResponse({ description: 'O alerta informado já está vinculado a outra ocorrência' })
  criar(@Body() dados: CriarOcorrenciaDto, @UsuarioAtual() usuario: Usuario, @Ip() ip: string): Promise<OcorrenciaDto> {
    return this.ocorrencias.criar(dados, { usuarioId: usuario.id, enderecoIp: ip ?? null });
  }

  @Get('ocorrencias/categorias')
  @ApiOperation({ summary: 'Categorias de ocorrência' })
  @ApiOkResponse({ type: [String] })
  categorias(): readonly string[] {
    return CATEGORIAS_OCORRENCIA;
  }

  @Get('ocorrencias/:id')
  @ApiOperation({ summary: 'Detalhe da ocorrência com o histórico do atendimento e os alertas vinculados' })
  @ApiOkResponse({ type: DetalheOcorrenciaDto })
  @ApiNotFoundResponse()
  detalhe(@Param('id') id: string): Promise<DetalheOcorrenciaDto> {
    return this.ocorrencias.detalhe(id);
  }

  @Post('ocorrencias/:id/providencias')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Registra uma providência e, se pedido, muda a situação; encerrar fecha os alertas vinculados ainda em atendimento',
  })
  @ApiOkResponse({ type: OcorrenciaDto })
  @ApiBadRequestResponse({ description: 'Providência vazia ou situação inválida' })
  @ApiNotFoundResponse()
  @ApiConflictResponse({ description: 'Ocorrência já encerrada' })
  @ApiForbiddenResponse({ description: 'Ocorrência de outro órgão' })
  async atualizar(
    @Param('id') id: string,
    @Body() dados: AtualizarOcorrenciaDto,
    @UsuarioAtual() usuario: Usuario,
    @Ip() ip: string,
  ): Promise<OcorrenciaDto> {
    const { ocorrencia, alertasEncerrados } = await this.ocorrencias.atualizar(id, dados, {
      usuarioId: usuario.id,
      enderecoIp: ip ?? null,
      orgaoRestrito: usuario.permissoes.includes('administrar') ? null : usuario.orgao.id,
    });
    for (const alertaId of alertasEncerrados) await this.eventosAlertas.atualizado(alertaId);
    return ocorrencia;
  }

  @Get('orgaos')
  @ApiOperation({ summary: 'Órgãos responsáveis pelo atendimento' })
  @ApiOkResponse({ type: [OrgaoDto] })
  orgaos(): Promise<OrgaoDto[]> {
    return this.ocorrencias.orgaos();
  }
}

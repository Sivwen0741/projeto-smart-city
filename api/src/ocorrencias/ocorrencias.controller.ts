import { Body, Controller, Get, Ip, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import { Usuario } from '../usuarios/usuario.entity';
import { CATEGORIAS_OCORRENCIA } from './categorias';
import { CriarOcorrenciaDto, OcorrenciaDto, OrgaoDto } from './dto/ocorrencia.dto';
import { OcorrenciasService } from './ocorrencias.service';

@ApiTags('ocorrências')
@ApiBearerAuth()
@Controller()
export class OcorrenciasController {
  constructor(private readonly ocorrencias: OcorrenciasService) {}

  @Get('ocorrencias')
  @ApiOperation({ summary: 'Ocorrências ainda não encerradas, da mais grave para a menos grave' })
  @ApiOkResponse({ type: [OcorrenciaDto] })
  listar(): Promise<OcorrenciaDto[]> {
    return this.ocorrencias.listarAbertas();
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

  @Get('orgaos')
  @ApiOperation({ summary: 'Órgãos responsáveis pelo atendimento' })
  @ApiOkResponse({ type: [OrgaoDto] })
  orgaos(): Promise<OrgaoDto[]> {
    return this.ocorrencias.orgaos();
  }
}

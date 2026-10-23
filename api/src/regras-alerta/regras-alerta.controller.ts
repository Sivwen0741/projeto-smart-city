import { Body, Controller, Get, Ip, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import { Usuario } from '../usuarios/usuario.entity';
import { AlteracaoRegraDto, AtualizarRegraAlertaDto, CriarRegraAlertaDto, RegraAlertaDto } from './dto/regra-alerta.dto';
import { RegrasAlertaService } from './regras-alerta.service';

@ApiTags('regras de alerta')
@ApiBearerAuth()
@Controller('regras-alerta')
export class RegrasAlertaController {
  constructor(private readonly regras: RegrasAlertaService) {}

  @Get()
  @ApiOperation({ summary: 'Regras de alerta, ativas e desativadas; cada uma vale para a cidade toda' })
  @ApiOkResponse({ type: [RegraAlertaDto] })
  listar(): Promise<RegraAlertaDto[]> {
    return this.regras.listar();
  }

  @Get(':id')
  @ApiOkResponse({ type: RegraAlertaDto })
  @ApiNotFoundResponse()
  buscar(@Param('id') id: string): Promise<RegraAlertaDto> {
    return this.regras.buscar(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastra uma regra de alerta' })
  @ApiCreatedResponse({ type: RegraAlertaDto })
  @ApiBadRequestResponse({ description: 'Limite vazio, operador não selecionado, duração negativa ou outro campo inválido' })
  criar(@Body() dados: CriarRegraAlertaDto, @UsuarioAtual() usuario: Usuario, @Ip() ip: string): Promise<RegraAlertaDto> {
    return this.regras.criar(dados, { usuarioId: usuario.id, enderecoIp: ip ?? null });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Altera a regra, inclusive o limite; "ativa": false desativa sem excluir' })
  @ApiOkResponse({ type: RegraAlertaDto })
  @ApiNotFoundResponse()
  atualizar(
    @Param('id') id: string,
    @Body() dados: AtualizarRegraAlertaDto,
    @UsuarioAtual() usuario: Usuario,
    @Ip() ip: string,
  ): Promise<RegraAlertaDto> {
    return this.regras.atualizar(id, dados, { usuarioId: usuario.id, enderecoIp: ip ?? null });
  }

  @Get(':id/alteracoes')
  @ApiOperation({ summary: 'Histórico de alterações da regra, com valor anterior e novo' })
  @ApiOkResponse({ type: [AlteracaoRegraDto] })
  @ApiNotFoundResponse()
  alteracoes(@Param('id') id: string): Promise<AlteracaoRegraDto[]> {
    return this.regras.alteracoes(id);
  }
}

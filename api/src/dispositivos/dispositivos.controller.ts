import { Body, Controller, Get, Ip, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Exige } from '../auth/permissao.decorator';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import { GRANDEZAS } from '../grandezas';
import { Usuario } from '../usuarios/usuario.entity';
import { DispositivosService } from './dispositivos.service';
import {
  AtualizarDispositivoDto,
  ColecaoBairrosDto,
  CriarDispositivoDto,
  DispositivoDto,
  GrandezaDto,
  LeituraDto,
  ListarDispositivosDto,
  ListarLeiturasDto,
  LocalDto,
  LocalizarDto,
  TipoDispositivoDto,
} from './dto/dispositivo.dto';

@ApiTags('dispositivos')
@ApiBearerAuth()
@Controller()
export class DispositivosController {
  constructor(private readonly dispositivos: DispositivosService) {}

  @Get('grandezas')
  @ApiOperation({ summary: 'Grandezas observadas pelos sensores e pelas regras de alerta' })
  @ApiOkResponse({ type: [GrandezaDto] })
  grandezas(): GrandezaDto[] {
    return Object.entries(GRANDEZAS).map(([codigo, g]) => ({ codigo, ...g }));
  }

  @Get('tipos-dispositivo')
  @ApiOperation({ summary: 'Tipos de dispositivo com os atributos próprios de cada um' })
  @ApiOkResponse({ type: [TipoDispositivoDto] })
  tipos(): Promise<TipoDispositivoDto[]> {
    return this.dispositivos.listarTipos();
  }

  @Get('territorio/localizar')
  @ApiOperation({ summary: 'Bairro e distrito de uma coordenada, por consulta espacial' })
  @ApiOkResponse({ type: LocalDto })
  @ApiUnprocessableEntityResponse({ description: 'Coordenada fora do município' })
  localizar(@Query() { latitude, longitude }: LocalizarDto): Promise<LocalDto> {
    return this.dispositivos.localizar(latitude, longitude);
  }

  @Get('territorio/bairros')
  @ApiOperation({ summary: 'Limites dos bairros em GeoJSON, simplificados para o mapa' })
  @ApiOkResponse({ type: ColecaoBairrosDto })
  bairros(): Promise<ColecaoBairrosDto> {
    return this.dispositivos.bairros();
  }

  @Get('dispositivos')
  @ApiOperation({ summary: 'Lista os dispositivos, inclusive inativos, na ordem pedida' })
  @ApiOkResponse({ type: [DispositivoDto] })
  listar(@Query() { ordem, direcao }: ListarDispositivosDto): Promise<DispositivoDto[]> {
    return this.dispositivos.listar(ordem, direcao);
  }

  @Get('dispositivos/:id')
  @ApiOkResponse({ type: DispositivoDto })
  @ApiNotFoundResponse()
  buscar(@Param('id') id: string): Promise<DispositivoDto> {
    return this.dispositivos.buscar(id);
  }

  @Post('dispositivos')
  @Exige('configurar')
  @ApiOperation({ summary: 'Cadastra um dispositivo; o bairro sai da coordenada' })
  @ApiCreatedResponse({ type: DispositivoDto })
  @ApiBadRequestResponse({ description: 'Campo inválido ou atributo que não pertence ao tipo' })
  @ApiConflictResponse({ description: 'Código identificador já cadastrado' })
  @ApiUnprocessableEntityResponse({ description: 'Coordenada fora do município' })
  criar(@Body() dados: CriarDispositivoDto, @UsuarioAtual() usuario: Usuario, @Ip() ip: string): Promise<DispositivoDto> {
    return this.dispositivos.criar(dados, { usuarioId: usuario.id, enderecoIp: ip ?? null });
  }

  @Patch('dispositivos/:id')
  @Exige('configurar')
  @ApiOperation({ summary: 'Edita um dispositivo; estado "inativo" inativa sem excluir' })
  @ApiOkResponse({ type: DispositivoDto })
  @ApiNotFoundResponse()
  @ApiConflictResponse({ description: 'Código identificador já cadastrado' })
  atualizar(
    @Param('id') id: string,
    @Body() dados: AtualizarDispositivoDto,
    @UsuarioAtual() usuario: Usuario,
    @Ip() ip: string,
  ): Promise<DispositivoDto> {
    return this.dispositivos.atualizar(id, dados, { usuarioId: usuario.id, enderecoIp: ip ?? null });
  }

  @Get('dispositivos/:id/leituras')
  @ApiOperation({ summary: 'Histórico de leituras, disponível também para dispositivo inativo' })
  @ApiOkResponse({ type: [LeituraDto] })
  @ApiNotFoundResponse()
  leituras(@Param('id') id: string, @Query() { limite }: ListarLeiturasDto): Promise<LeituraDto[]> {
    return this.dispositivos.leituras(id, limite);
  }
}

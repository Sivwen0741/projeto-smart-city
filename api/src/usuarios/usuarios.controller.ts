import { Body, Controller, Get, HttpCode, Ip, Param, Patch, Post } from '@nestjs/common';
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
} from '@nestjs/swagger';
import { Exige } from '../auth/permissao.decorator';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import { AtualizarUsuarioDto, CriarUsuarioDto, PerfilDto, SenhaProvisoriaDto, UsuarioCriadoDto, UsuarioDto } from './dto/usuario.dto';
import { Usuario } from './usuario.entity';
import { UsuariosService } from './usuarios.service';

@ApiTags('usuários')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'Perfil sem a permissão administrar' })
@Exige('administrar')
@Controller()
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get('usuarios')
  @ApiOperation({ summary: 'Usuários, ativos primeiro' })
  @ApiOkResponse({ type: [UsuarioDto] })
  listar(): Promise<UsuarioDto[]> {
    return this.usuarios.listar();
  }

  @Get('perfis')
  @ApiOperation({ summary: 'Perfis fixos e as permissões de cada um' })
  @ApiOkResponse({ type: [PerfilDto] })
  perfis(): Promise<PerfilDto[]> {
    return this.usuarios.perfis();
  }

  @Post('usuarios')
  @ApiOperation({ summary: 'Cadastra um usuário e devolve a senha provisória, mostrada uma única vez' })
  @ApiCreatedResponse({ type: UsuarioCriadoDto })
  @ApiBadRequestResponse({ description: 'Campo inválido, e-mail fora do domínio funcional, órgão ou perfil inexistente' })
  @ApiConflictResponse({ description: 'E-mail já cadastrado' })
  criar(@Body() dados: CriarUsuarioDto, @UsuarioAtual() usuario: Usuario, @Ip() ip: string): Promise<UsuarioCriadoDto> {
    return this.usuarios.criar(dados, { usuarioId: usuario.id, enderecoIp: ip ?? null });
  }

  @Patch('usuarios/:id')
  @ApiOperation({ summary: 'Altera nome, e-mail, órgão, perfil ou situação; "ativo": false inativa sem excluir' })
  @ApiOkResponse({ type: UsuarioDto })
  @ApiNotFoundResponse()
  @ApiConflictResponse({ description: 'E-mail já cadastrado, ou o administrador tentou inativar ou mudar o próprio perfil' })
  atualizar(@Param('id') id: string, @Body() dados: AtualizarUsuarioDto, @UsuarioAtual() usuario: Usuario, @Ip() ip: string): Promise<UsuarioDto> {
    return this.usuarios.atualizar(id, dados, { usuarioId: usuario.id, enderecoIp: ip ?? null });
  }

  @Post('usuarios/:id/senha-provisoria')
  @HttpCode(200)
  @ApiOperation({ summary: 'Gera nova senha provisória; a anterior deixa de valer' })
  @ApiOkResponse({ type: SenhaProvisoriaDto })
  @ApiNotFoundResponse()
  async senhaProvisoria(@Param('id') id: string, @UsuarioAtual() usuario: Usuario, @Ip() ip: string): Promise<SenhaProvisoriaDto> {
    return { senhaProvisoria: await this.usuarios.gerarSenha(id, { usuarioId: usuario.id, enderecoIp: ip ?? null }) };
  }
}

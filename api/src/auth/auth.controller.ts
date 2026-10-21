import { Body, Controller, Get, HttpCode, Ip, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Usuario } from '../usuarios/usuario.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SessaoDto, UsuarioSessaoDto } from './dto/sessao.dto';
import { Publico } from './publico.decorator';
import { UsuarioAtual } from './usuario-atual.decorator';

@ApiTags('autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Publico()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Autentica com e-mail funcional e senha; o token vale por oito horas' })
  @ApiOkResponse({ type: SessaoDto })
  @ApiUnauthorizedResponse({ description: 'Credencial inválida, sem indicar se o e-mail existe' })
  entrar(@Body() dados: LoginDto, @Ip() ip: string): Promise<SessaoDto> {
    return this.auth.autenticar(dados.email, dados.senha, ip ?? null);
  }

  @Get('eu')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Usuário da sessão atual' })
  @ApiOkResponse({ type: UsuarioSessaoDto })
  eu(@UsuarioAtual() usuario: Usuario): UsuarioSessaoDto {
    return UsuarioSessaoDto.de(usuario);
  }
}

import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { Permissao, PERMISSAO_EXIGIDA } from './permissao.decorator';
import { ROTA_PUBLICA } from './publico.decorator';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const publica = this.reflector.getAllAndOverride<boolean>(ROTA_PUBLICA, [contexto.getHandler(), contexto.getClass()]);
    if (publica) return true;

    const requisicao = contexto.switchToHttp().getRequest();
    const [tipo, token] = (requisicao.headers.authorization ?? '').split(' ');
    const usuario = tipo === 'Bearer' && token ? await this.auth.usuarioDoToken(token) : null;
    if (!usuario) throw new UnauthorizedException('Sessão inválida ou expirada. Entre novamente.');
    requisicao.usuario = usuario;

    const exigida =
      this.reflector.getAllAndOverride<Permissao>(PERMISSAO_EXIGIDA, [contexto.getHandler(), contexto.getClass()]) ??
      (requisicao.method === 'GET' ? 'consultar' : 'operar');
    if (!usuario.permissoes.includes(exigida)) throw new ForbiddenException('Seu perfil não permite esta ação.');
    return true;
  }
}

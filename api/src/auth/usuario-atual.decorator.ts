import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from '../usuarios/usuario.entity';

export const UsuarioAtual = createParamDecorator(
  (_: unknown, contexto: ExecutionContext): Usuario => contexto.switchToHttp().getRequest().usuario,
);

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { LogAtividadeModule } from '../log-atividade/log-atividade.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';

@Module({
  imports: [
    UsuariosModule,
    LogAtividadeModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const segredo = process.env.JWT_SEGREDO;
        if (!segredo || segredo.length < 32) throw new Error('JWT_SEGREDO precisa ter ao menos 32 caracteres');
        return { secret: segredo };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: JwtGuard }],
  exports: [AuthService],
})
export class AuthModule {}

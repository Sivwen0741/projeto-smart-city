import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orgao } from './orgao.entity';
import { Perfil } from './perfil.entity';
import { Usuario } from './usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Orgao, Perfil])],
  exports: [TypeOrmModule],
})
export class UsuariosModule {}

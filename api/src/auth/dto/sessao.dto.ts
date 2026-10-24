import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/usuario.entity';

export class UsuarioSessaoDto {
  @ApiProperty() id: string;
  @ApiProperty() nome: string;
  @ApiProperty() email: string;
  @ApiProperty({ example: 'administrador' }) perfil: string;
  @ApiProperty({ example: 'DTI' }) orgao: string;

  static de(usuario: Usuario): UsuarioSessaoDto {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil.nome,
      orgao: usuario.orgao.sigla,
    };
  }
}

export class SessaoDto {
  @ApiProperty() token: string;
  @ApiProperty({ description: 'Momento em que o token deixa de valer' }) expiraEm: string;
  @ApiProperty({ type: UsuarioSessaoDto }) usuario: UsuarioSessaoDto;
}

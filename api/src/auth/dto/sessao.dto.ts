import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/usuario.entity';
import { Permissao, PERMISSOES } from '../permissao.decorator';

export class UsuarioSessaoDto {
  @ApiProperty() id: string;
  @ApiProperty() nome: string;
  @ApiProperty() email: string;
  @ApiProperty({ example: 'administrador' }) perfil: string;
  @ApiProperty({ example: 'DTI' }) orgao: string;
  @ApiProperty({ example: '3' }) orgaoId: string;
  @ApiProperty({ enum: PERMISSOES, isArray: true }) permissoes: Permissao[];

  static de(usuario: Usuario): UsuarioSessaoDto {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil.nome,
      orgao: usuario.orgao.sigla,
      orgaoId: usuario.orgao.id,
      permissoes: usuario.permissoes,
    };
  }
}

export class SessaoDto {
  @ApiProperty() token: string;
  @ApiProperty({ description: 'Momento em que o token deixa de valer' }) expiraEm: string;
  @ApiProperty({ type: UsuarioSessaoDto }) usuario: UsuarioSessaoDto;
}

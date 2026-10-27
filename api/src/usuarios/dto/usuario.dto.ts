import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { Permissao, PERMISSOES } from '../../auth/permissao.decorator';

export const DOMINIO_FUNCIONAL = 'pontagrossa.pr.gov.br';

const aparar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const emailNormalizado = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);
const EMAIL_FUNCIONAL = new RegExp(`@${DOMINIO_FUNCIONAL.replace(/\./g, '\\.')}$`);
const MENSAGEM_FUNCIONAL = `Use o e-mail funcional (@${DOMINIO_FUNCIONAL}).`;

export class CriarUsuarioDto {
  @ApiProperty({ example: 'Helena Baptista' })
  @Transform(aparar)
  @IsString()
  @IsNotEmpty({ message: 'Informe o nome.' })
  @MaxLength(120, { message: 'O nome aceita até 120 caracteres.' })
  nome: string;

  @ApiProperty({ example: `helena.baptista@${DOMINIO_FUNCIONAL}` })
  @Transform(emailNormalizado)
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @Matches(EMAIL_FUNCIONAL, { message: MENSAGEM_FUNCIONAL })
  @MaxLength(160)
  email: string;

  @ApiProperty({ example: '1' })
  @IsString()
  @Matches(/^\d+$/, { message: 'Selecione o órgão.' })
  orgaoId: string;

  @ApiProperty({ example: '2' })
  @IsString()
  @Matches(/^\d+$/, { message: 'Selecione o perfil.' })
  perfilId: string;
}

export class AtualizarUsuarioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(aparar)
  @IsString()
  @IsNotEmpty({ message: 'Informe o nome.' })
  @MaxLength(120, { message: 'O nome aceita até 120 caracteres.' })
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emailNormalizado)
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @Matches(EMAIL_FUNCIONAL, { message: MENSAGEM_FUNCIONAL })
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'Selecione o órgão.' })
  orgaoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'Selecione o perfil.' })
  perfilId?: string;

  @ApiPropertyOptional({ description: 'false inativa o usuário, que deixa de entrar; não há exclusão' })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}

export class UsuarioDto {
  @ApiProperty() id: string;
  @ApiProperty() nome: string;
  @ApiProperty() email: string;
  @ApiProperty() orgaoId: string;
  @ApiProperty({ example: 'Defesa Civil' }) orgao: string;
  @ApiProperty() perfilId: string;
  @ApiProperty({ example: 'operador' }) perfil: string;
  @ApiProperty() ativo: boolean;
  @ApiPropertyOptional({ nullable: true }) ultimoAcesso: string | null;
}

export class UsuarioCriadoDto {
  @ApiProperty({ type: UsuarioDto }) usuario: UsuarioDto;
  @ApiProperty({ description: 'Mostrada uma única vez; o administrador entrega ao usuário' }) senhaProvisoria: string;
}

export class SenhaProvisoriaDto {
  @ApiProperty({ description: 'Mostrada uma única vez; a senha anterior deixa de valer' }) senhaProvisoria: string;
}

export class PerfilDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'operador' }) nome: string;
  @ApiPropertyOptional({ nullable: true }) descricao: string | null;
  @ApiProperty({ enum: PERMISSOES, isArray: true }) permissoes: Permissao[];
}

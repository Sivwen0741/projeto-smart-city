import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsLatitude, IsLongitude, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { CRITICIDADES } from '../../regras-alerta/dto/regra-alerta.dto';
import { CATEGORIAS_OCORRENCIA } from '../categorias';

const vazioComoNulo = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? (value.trim() === '' ? null : value.trim()) : value;

export class CriarOcorrenciaDto {
  @ApiProperty({ enum: CATEGORIAS_OCORRENCIA, example: 'Alagamento' })
  @IsIn(CATEGORIAS_OCORRENCIA, { message: 'Escolha a categoria.' })
  categoria: string;

  @ApiProperty({ enum: CRITICIDADES, example: 'grave' })
  @IsIn(CRITICIDADES, { message: 'Escolha a gravidade.' })
  criticidade: (typeof CRITICIDADES)[number];

  @ApiPropertyOptional({ example: '4', description: 'Órgão responsável, de GET /api/orgaos' })
  @IsOptional()
  @Transform(vazioComoNulo)
  @Matches(/^\d+$/, { message: 'Órgão inválido.' })
  orgaoId?: string | null;

  @ApiPropertyOptional({ example: 'Morador informa lâmina de água sobre a faixa da direita.' })
  @IsOptional()
  @Transform(vazioComoNulo)
  @IsString()
  @MaxLength(2000, { message: 'A descrição tem no máximo 2000 caracteres.' })
  descricao?: string | null;

  @ApiProperty({ example: -25.0921 })
  @IsLatitude({ message: 'Marque a localização no mapa.' })
  latitude: number;

  @ApiProperty({ example: -50.1612 })
  @IsLongitude({ message: 'Marque a localização no mapa.' })
  longitude: number;

  @ApiPropertyOptional({ example: 'Av. Visconde de Taunay, 1840' })
  @IsOptional()
  @Transform(vazioComoNulo)
  @IsString()
  @MaxLength(255)
  endereco?: string | null;

  @ApiPropertyOptional({ description: 'Alerta que originou a ocorrência; fica vinculado a ela' })
  @IsOptional()
  @Matches(/^\d+$/, { message: 'Alerta inválido.' })
  alertaId?: string;
}

export class OcorrenciaDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: '2026-08-1147' }) protocolo: string;
  @ApiProperty({ example: 'Risco hidrológico' }) categoria: string;
  @ApiPropertyOptional({ nullable: true }) descricao: string | null;
  @ApiProperty({ example: 'grave' }) criticidade: string;
  @ApiProperty({ example: 'aberta' }) situacao: string;
  @ApiProperty({ example: 'telefone', enum: ['telefone', 'alerta'] }) origem: string;
  @ApiPropertyOptional({ nullable: true }) latitude: number | null;
  @ApiPropertyOptional({ nullable: true }) longitude: number | null;
  @ApiPropertyOptional({ nullable: true }) endereco: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'Olarias' }) bairro: string | null;
  @ApiPropertyOptional({ nullable: true }) orgaoId: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'Defesa Civil' }) orgao: string | null;
  @ApiPropertyOptional({ nullable: true }) registradaPor: string | null;
  @ApiProperty() dataAbertura: string;
}

export class OrgaoDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'Defesa Civil' }) nome: string;
  @ApiProperty({ example: 'DC' }) sigla: string;
}

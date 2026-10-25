import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OcorrenciaDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: '2026-08-1147' }) protocolo: string;
  @ApiProperty({ example: 'Risco hidrológico' }) categoria: string;
  @ApiPropertyOptional({ nullable: true }) descricao: string | null;
  @ApiProperty({ example: 'grave' }) criticidade: string;
  @ApiProperty({ example: 'em_atendimento' }) situacao: string;
  @ApiPropertyOptional({ nullable: true }) latitude: number | null;
  @ApiPropertyOptional({ nullable: true }) longitude: number | null;
  @ApiPropertyOptional({ nullable: true, example: 'Olarias' }) bairro: string | null;
  @ApiProperty() dataAbertura: string;
}

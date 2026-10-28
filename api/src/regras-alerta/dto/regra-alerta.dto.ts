import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { CODIGOS_GRANDEZA } from '../../grandezas';

export const OPERADORES = ['>', '>=', '<', '<=', '=', '<>'] as const;
export const CRITICIDADES = ['grave', 'atencao', 'informativo'] as const;

const aparar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CriarRegraAlertaDto {
  @ApiProperty({ example: 'Nível do arroio acima da cota' })
  @Transform(aparar)
  @IsString({ message: 'Informe o nome da regra.' })
  @IsNotEmpty({ message: 'Informe o nome da regra.' })
  @MaxLength(120, { message: 'O nome tem no máximo 120 caracteres.' })
  nome: string;

  @ApiProperty({ example: 'nivel_agua', description: 'Código de GET /api/grandezas' })
  @IsIn(CODIGOS_GRANDEZA, { message: 'Escolha a grandeza observada.' })
  tipoGrandeza: string;

  @ApiProperty({ enum: OPERADORES, example: '>' })
  @IsIn(OPERADORES, { message: 'Escolha o operador de comparação.' })
  operador: (typeof OPERADORES)[number];

  @ApiProperty({ example: 3.5 })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Informe o valor limite.' })
  valorLimite: number;

  @ApiProperty({ example: 10, description: 'Minutos que a condição precisa durar; 0 dispara na primeira leitura' })
  @IsInt({ message: 'Informe a duração mínima em minutos inteiros.' })
  @Min(0, { message: 'A duração mínima não pode ser negativa.' })
  duracaoMinutos: number;

  @ApiProperty({ enum: CRITICIDADES, example: 'grave' })
  @IsIn(CRITICIDADES, { message: 'Escolha a gravidade.' })
  criticidade: (typeof CRITICIDADES)[number];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean({ message: 'Ativa deve ser verdadeiro ou falso.' })
  ativa?: boolean;
}

export class AtualizarRegraAlertaDto extends PartialType(CriarRegraAlertaDto) {
  @ApiPropertyOptional({ example: 50, description: 'Só na regra de risco de enchente: chuva no bairro, em mm' })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Informe o limite de precipitação.' })
  @Min(0.01, { message: 'O limite de precipitação precisa ser maior que zero.' })
  limitePrecipitacao?: number;

  @ApiPropertyOptional({ example: 15, description: 'Só na regra de risco de enchente: vazão prevista, em m³/s' })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Informe o limite de vazão prevista.' })
  @Min(0.01, { message: 'O limite de vazão prevista precisa ser maior que zero.' })
  limiteVazaoPrevista?: number;

  @ApiPropertyOptional({ example: 24, description: 'Só na regra de risco de enchente: janela em horas' })
  @IsOptional()
  @IsInt({ message: 'Informe a janela em horas inteiras.' })
  @Min(1, { message: 'A janela precisa ter pelo menos 1 hora.' })
  janelaHoras?: number;
}

export class RegraAlertaDto {
  @ApiProperty() id: string;
  @ApiProperty() nome: string;
  @ApiProperty({ example: 'nivel_agua' }) tipoGrandeza: string;
  @ApiProperty({ enum: OPERADORES }) operador: string;
  @ApiProperty() valorLimite: number;
  @ApiProperty() duracaoMinutos: number;
  @ApiProperty({ enum: CRITICIDADES }) criticidade: string;
  @ApiProperty() ativa: boolean;
  @ApiProperty({ description: 'Alertas já gerados por esta regra' }) alertas: number;
  @ApiProperty({ description: 'Regra mantida pelo sistema (US07): aparece na lista, mas não pode ser alterada' }) sistema: boolean;
  @ApiProperty({ enum: ['simples', 'risco_enchente'], description: 'risco_enchente combina o nível com chuva ou vazão prevista (US10)' }) tipo: string;
  @ApiPropertyOptional({ nullable: true, example: 50 }) limitePrecipitacao: number | null;
  @ApiPropertyOptional({ nullable: true, example: 15 }) limiteVazaoPrevista: number | null;
  @ApiPropertyOptional({ nullable: true, example: 24 }) janelaHoras: number | null;
}

export class AlteracaoRegraDto {
  @ApiProperty({ example: 'edicao_regra_alerta' }) acao: string;
  @ApiPropertyOptional({ nullable: true }) autor: string | null;
  @ApiProperty() dataHora: string;
  @ApiPropertyOptional({ nullable: true }) antes: Record<string, unknown> | null;
  @ApiPropertyOptional({ nullable: true }) depois: Record<string, unknown> | null;
}

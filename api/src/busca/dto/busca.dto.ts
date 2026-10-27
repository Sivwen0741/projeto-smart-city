import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export const MINIMO_CARACTERES = 3;

export class BuscarDto {
  @ApiProperty({ example: 'uvaranas', description: `Protocolo, endereço, bairro ou código de dispositivo, com ${MINIMO_CARACTERES} caracteres ou mais` })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Informe o texto da busca.' })
  @MinLength(MINIMO_CARACTERES, { message: `A busca precisa de pelo menos ${MINIMO_CARACTERES} caracteres.` })
  @MaxLength(100, { message: 'A busca aceita até 100 caracteres.' })
  q: string;
}

export class OcorrenciaEncontradaDto {
  @ApiProperty({ example: '42' }) id: string;
  @ApiProperty({ example: '2026-10-1147' }) protocolo: string;
  @ApiProperty({ example: 'Alagamento' }) categoria: string;
  @ApiProperty({ enum: ['grave', 'atencao', 'informativo'] }) criticidade: string;
  @ApiProperty({ example: 'aberta' }) situacao: string;
  @ApiPropertyOptional({ nullable: true, example: 'Rua Balduíno Taques, 445' }) endereco: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'Centro' }) bairro: string | null;
}

export class DispositivoEncontradoDto {
  @ApiProperty({ example: '7' }) id: string;
  @ApiProperty({ example: 'EA-07' }) identificador: string;
  @ApiProperty({ example: 'Estação ambiental' }) tipo: string;
  @ApiProperty({ enum: ['operando', 'sem_comunicacao', 'manutencao', 'inativo'] }) situacao: string;
  @ApiPropertyOptional({ nullable: true, example: 'Praça Marechal Floriano' }) endereco: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'Chapada' }) bairro: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'Guaragi', description: 'Distrito, quando o dispositivo está fora de bairro' }) distrito: string | null;
}

export class ResultadoBuscaDto {
  @ApiProperty({ type: [OcorrenciaEncontradaDto], description: 'Em andamento primeiro, depois da mais recente' }) ocorrencias: OcorrenciaEncontradaDto[];
  @ApiProperty({ type: [DispositivoEncontradoDto], description: 'Pelo código' }) dispositivos: DispositivoEncontradoDto[];
}

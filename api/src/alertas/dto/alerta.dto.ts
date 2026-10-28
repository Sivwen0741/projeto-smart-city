import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export const VISOES = ['ativos', 'em_atendimento', 'encerrados_hoje'] as const;
export type Visao = (typeof VISOES)[number];

export class ListarAlertasDto {
  @ApiPropertyOptional({ enum: VISOES, default: 'ativos', description: 'Ativos são os abertos e os em atendimento' })
  @IsOptional()
  @IsIn(VISOES, { message: 'Visão deve ser ativos, em_atendimento ou encerrados_hoje.' })
  visao?: Visao;
}

export class AlertaDto {
  @ApiProperty() id: string;
  @ApiProperty() regraId: string;
  @ApiProperty({ example: 'Nível do arroio acima da cota' }) regra: string;
  @ApiProperty({ example: 'nivel_agua' }) tipoGrandeza: string;
  @ApiPropertyOptional({ nullable: true, example: 'm' }) unidade: string | null;
  @ApiProperty() dispositivoId: string;
  @ApiProperty({ example: 'SN-014' }) dispositivo: string;
  @ApiProperty({ example: 'Sensor de nível' }) tipoDispositivo: string;
  @ApiPropertyOptional({ nullable: true }) endereco: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'Olarias' }) bairro: string | null;
  @ApiProperty({ description: 'Posição do dispositivo' }) latitude: number;
  @ApiProperty({ description: 'Posição do dispositivo' }) longitude: number;
  @ApiPropertyOptional({ example: 3.81, nullable: true, description: 'Nulo no alerta de dispositivo que nunca se comunicou' }) valorObservado: number | null;
  @ApiProperty({ example: '>' }) operador: string;
  @ApiProperty({ example: 3.5 }) valorLimite: number;
  @ApiProperty({ example: 'grave' }) criticidade: string;
  @ApiProperty({ example: 'aberto' }) situacao: string;
  @ApiProperty() dataHora: string;
  @ApiPropertyOptional({ nullable: true }) dataReconhecimento: string | null;
  @ApiPropertyOptional({ nullable: true }) reconhecidoPor: string | null;
  @ApiPropertyOptional({ nullable: true }) providencia: string | null;
  @ApiPropertyOptional({ nullable: true }) dataEncerramento: string | null;
  @ApiPropertyOptional({ nullable: true, description: 'Órgão da ocorrência vinculada' }) orgao: string | null;
  @ApiPropertyOptional({ nullable: true }) ocorrenciaId: string | null;
  @ApiProperty({ description: 'A leitura que disparou o alerta veio do simulador' }) simulado: boolean;
}

export class SemComunicacaoPorTipoDto {
  @ApiProperty({ example: 'Estação ambiental' }) tipo: string;
  @ApiProperty() quantidade: number;
}

export class ResumoAlertasDto {
  @ApiProperty() ativos: number;
  @ApiProperty() gravesSemReconhecimento: number;
  @ApiProperty() emAtendimento: number;
  @ApiProperty() encerradosHoje: number;
  @ApiPropertyOptional({ nullable: true, description: 'Média nas últimas 24 h, em minutos; nulo sem reconhecimento no período' })
  tempoMedioReconhecimentoMinutos: number | null;
  @ApiProperty() ultimas24h: number;
  @ApiProperty() encerradosUltimas24h: number;
  @ApiPropertyOptional({ type: () => AlertaDto, nullable: true, description: 'Grave sem reconhecimento mais antigo, para a faixa fixa' })
  graveMaisAntigo: AlertaDto | null;
  @ApiProperty() semComunicacao: number;
  @ApiProperty({ type: [SemComunicacaoPorTipoDto] }) semComunicacaoPorTipo: SemComunicacaoPorTipoDto[];
}

export class ReconhecerAlertaDto {
  @ApiProperty({ example: 'Confirmado com a câmera CAM-22; Defesa Civil acionada por telefone.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Informe a providência adotada.' })
  @IsNotEmpty({ message: 'Informe a providência adotada.' })
  @MaxLength(2000, { message: 'A providência tem no máximo 2000 caracteres.' })
  providencia: string;
}

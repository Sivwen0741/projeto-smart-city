import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
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
  @ApiPropertyOptional({ nullable: true }) dataEncerramento: string | null;
}

export const VISOES_OCORRENCIA = ['andamento', 'encerradas'] as const;
export type VisaoOcorrencia = (typeof VISOES_OCORRENCIA)[number];

export class ListarOcorrenciasDto {
  @ApiPropertyOptional({ enum: VISOES_OCORRENCIA, default: 'andamento', description: 'Em andamento são as abertas e as em atendimento; encerradas, as dos últimos 30 dias' })
  @IsOptional()
  @IsIn(VISOES_OCORRENCIA, { message: 'Visão deve ser andamento ou encerradas.' })
  visao?: VisaoOcorrencia;
}

export class AtualizarOcorrenciaDto {
  @ApiProperty({ example: 'Equipe da Defesa Civil no local; faixa da direita interditada.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Escreva a providência.' })
  @IsNotEmpty({ message: 'Escreva a providência.' })
  @MaxLength(2000, { message: 'A providência tem no máximo 2000 caracteres.' })
  observacao: string;

  @ApiPropertyOptional({
    enum: ['em_atendimento', 'encerrada'],
    description: 'Sem situação, a providência mantém a situação; numa ocorrência aberta, passa para em atendimento',
  })
  @IsOptional()
  @IsIn(['em_atendimento', 'encerrada'], { message: 'Situação deve ser em_atendimento ou encerrada.' })
  situacao?: 'em_atendimento' | 'encerrada';
}

export class RegistroHistoricoDto {
  @ApiProperty({ enum: ['ocorrencia', 'alerta_gerado', 'alerta_reconhecido'] }) tipo: string;
  @ApiProperty() dataHora: string;
  @ApiPropertyOptional({ nullable: true, example: 'aberta' }) situacaoAnterior: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'em_atendimento' }) situacaoNova: string | null;
  @ApiPropertyOptional({ nullable: true }) observacao: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'Ricardo Menezes' }) autor: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'Defesa Civil' }) orgaoAutor: string | null;
  @ApiPropertyOptional({ nullable: true, description: 'Para registros de alerta: regra, dispositivo e medição' }) alerta: {
    regra: string;
    dispositivo: string;
    valorObservado: number | null;
    valorLimite: number;
    operador: string;
    unidade: string | null;
  } | null;
}

export class AlertaVinculadoDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'Nível do arroio acima da cota' }) regra: string;
  @ApiProperty({ example: 'SN-014' }) dispositivo: string;
  @ApiProperty({ example: 'grave' }) criticidade: string;
  @ApiProperty({ example: 'em_atendimento' }) situacao: string;
  @ApiPropertyOptional({ nullable: true }) valorObservado: number | null;
  @ApiPropertyOptional({ nullable: true }) unidade: string | null;
  @ApiProperty() dataHora: string;
}

export class DetalheOcorrenciaDto extends OcorrenciaDto {
  @ApiPropertyOptional({ nullable: true, description: 'Autor da última providência' }) responsavel: string | null;
  @ApiProperty({ type: [RegistroHistoricoDto], description: 'Em ordem cronológica, com os alertas vinculados' }) historico: RegistroHistoricoDto[];
  @ApiProperty({ type: [AlertaVinculadoDto] }) alertas: AlertaVinculadoDto[];
}

export class OrgaoDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'Defesa Civil' }) nome: string;
  @ApiProperty({ example: 'DC' }) sigla: string;
}

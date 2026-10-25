import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { CRITICIDADES } from '../../regras-alerta/dto/regra-alerta.dto';
import { CampoAtributo } from '../atributos';

export const ESTADOS = ['ativo', 'manutencao', 'inativo'] as const;
export type Estado = (typeof ESTADOS)[number];

export const SITUACOES = ['operando', 'sem_comunicacao', 'manutencao', 'inativo'] as const;

export const ORDENACOES = ['codigo', 'tipo', 'localizacao', 'situacao', 'comunicacao'] as const;
export type Ordenacao = (typeof ORDENACOES)[number];

const aparar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const vazioComoNulo = ({ value }: { value: unknown }) => (typeof value === 'string' && value.trim() === '' ? null : aparar({ value }));

export class CriarDispositivoDto {
  @ApiProperty({ example: 'SN-014', description: 'Código identificador, único sem diferença de maiúsculas' })
  @Transform(aparar)
  @IsString()
  @IsNotEmpty({ message: 'Informe o código identificador.' })
  @Matches(/^[A-Za-z0-9][A-Za-z0-9-]{0,39}$/, { message: 'O código usa letras, números e hífen, com até 40 caracteres.' })
  identificador: string;

  @ApiProperty({ example: '1' })
  @IsString({ message: 'Informe o tipo do dispositivo.' })
  @Matches(/^\d+$/, { message: 'Informe o tipo do dispositivo.' })
  tipoDispositivoId: string;

  @ApiPropertyOptional({ example: 'Arroio Olarias, sob a ponte da Av. Visconde de Taunay' })
  @IsOptional()
  @Transform(vazioComoNulo)
  @IsString()
  @MaxLength(255)
  descricao?: string | null;

  @ApiPropertyOptional({ example: 'Av. Visconde de Taunay, ponte do Arroio Olarias' })
  @IsOptional()
  @Transform(vazioComoNulo)
  @IsString()
  @MaxLength(255)
  endereco?: string | null;

  @ApiProperty({ example: -25.09514 })
  @IsLatitude({ message: 'Latitude inválida.' })
  latitude: number;

  @ApiProperty({ example: -50.16187 })
  @IsLongitude({ message: 'Longitude inválida.' })
  longitude: number;

  @ApiPropertyOptional({ example: '2024-03-14' })
  @IsOptional()
  @Transform(vazioComoNulo)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data de instalação no formato AAAA-MM-DD.' })
  dataInstalacao?: string | null;

  @ApiPropertyOptional({ enum: ESTADOS, default: 'ativo' })
  @IsOptional()
  @IsIn(ESTADOS, { message: 'Situação deve ser ativo, manutencao ou inativo.' })
  estado?: Estado;

  @ApiPropertyOptional({
    example: { tipoGrandeza: 'nivel_agua', unidadeMedida: 'm', intervaloLeituraSegundos: 30 },
    description: 'Atributos próprios do tipo, conforme GET /api/tipos-dispositivo',
  })
  @IsOptional()
  @IsObject({ message: 'Os atributos do tipo devem ser um objeto.' })
  atributos?: Record<string, unknown>;
}

export class AtualizarDispositivoDto extends PartialType(CriarDispositivoDto) {}

export class ListarDispositivosDto {
  @ApiPropertyOptional({ enum: ORDENACOES, default: 'codigo' })
  @IsOptional()
  @IsIn(ORDENACOES, { message: 'Ordenação inválida.' })
  ordem?: Ordenacao;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'Direção deve ser asc ou desc.' })
  direcao?: 'asc' | 'desc';
}

export class ListarLeiturasDto {
  @ApiPropertyOptional({ default: 100, maximum: 1000 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  limite?: number;
}

export class LocalizarDto {
  @ApiProperty({ example: -25.09514 })
  @Transform(({ value }) => Number(value))
  @IsLatitude({ message: 'Latitude inválida.' })
  latitude: number;

  @ApiProperty({ example: -50.16187 })
  @Transform(({ value }) => Number(value))
  @IsLongitude({ message: 'Longitude inválida.' })
  longitude: number;
}

export class LocalDto {
  @ApiPropertyOptional({ nullable: true, example: '12' }) bairroId: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'Olarias', description: 'Nulo na zona rural' }) bairro: string | null;
  @ApiProperty({ example: 'Ponta Grossa' }) distrito: string;
}

export class ColecaoBairrosDto {
  @ApiProperty({ example: 'FeatureCollection' }) type: string;
  @ApiProperty({ description: 'Um Feature por bairro, com nome e ponto do rótulo (longitude, latitude) nas propriedades' })
  features: Record<string, unknown>[];
}

export class GrandezaDto {
  @ApiProperty({ example: 'nivel_agua' }) codigo: string;
  @ApiProperty({ example: 'Nível de água' }) rotulo: string;
  @ApiProperty({ example: 'm' }) unidade: string;
}

export class TipoDispositivoDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'Sensor de nível' }) nome: string;
  @ApiProperty({ example: 'sensor_urbano' }) categoria: string;
  @ApiProperty({ example: 'Sensor urbano' }) rotuloCategoria: string;
  @ApiPropertyOptional({ nullable: true, example: 30 }) intervaloLeituraSegundos: number | null;
  @ApiProperty({ description: 'Atributos próprios gravados em jsonb' }) campos: CampoAtributo[];
}

export class DispositivoDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'SN-014' }) identificador: string;
  @ApiProperty() tipoDispositivoId: string;
  @ApiProperty({ example: 'Sensor de nível' }) tipo: string;
  @ApiProperty({ example: 'sensor_urbano' }) categoria: string;
  @ApiPropertyOptional({ nullable: true }) descricao: string | null;
  @ApiPropertyOptional({ nullable: true }) endereco: string | null;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiPropertyOptional({ nullable: true }) bairroId: string | null;
  @ApiPropertyOptional({ nullable: true }) bairro: string | null;
  @ApiPropertyOptional({ nullable: true }) distrito: string | null;
  @ApiPropertyOptional({ nullable: true, example: '2024-03-14' }) dataInstalacao: string | null;
  @ApiProperty({ enum: ESTADOS }) estado: Estado;
  @ApiProperty({ enum: SITUACOES, description: 'Calculada a partir do estado e da última comunicação' }) situacao: string;
  @ApiPropertyOptional({ nullable: true }) ultimaComunicacao: string | null;
  @ApiProperty({ description: 'Limite em segundos a partir do qual o dispositivo fica sem comunicação' })
  limiteComunicacaoSegundos: number;
  @ApiProperty() atributos: Record<string, unknown>;
  @ApiPropertyOptional({ enum: CRITICIDADES, nullable: true, description: 'Maior gravidade entre os alertas ativos do dispositivo' })
  alertaAtivo: (typeof CRITICIDADES)[number] | null;
  @ApiPropertyOptional({ type: () => UltimaLeituraDto, nullable: true }) ultimaLeitura: UltimaLeituraDto | null;
  @ApiProperty({ description: 'A última comunicação veio do simulador da equipe (documento de visão, 9.2)' }) simulado: boolean;
}

export class UltimaLeituraDto {
  @ApiProperty({ example: 'nivel_agua' }) grandeza: string;
  @ApiProperty({ example: 3.81 }) valor: number;
  @ApiPropertyOptional({ nullable: true, example: 'm' }) unidade: string | null;
  @ApiProperty() dataHora: string;
  @ApiProperty({ example: 'simulador', enum: ['mqtt', 'simulador', 'open-meteo'] }) origem: string;
}

export class LeituraDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'nivel_agua' }) tipoGrandeza: string;
  @ApiProperty() valor: number;
  @ApiPropertyOptional({ nullable: true }) unidade: string | null;
  @ApiProperty({ example: 'mqtt' }) origem: string;
  @ApiProperty() dataHora: string;
}

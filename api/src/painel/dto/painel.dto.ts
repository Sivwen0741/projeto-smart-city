import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IndicadorDto {
  @ApiProperty({ enum: ['rios', 'fluxo', 'ar', 'iluminacao', 'ruido', 'vagas'] }) chave: string;
  @ApiProperty({ example: 'Nível dos rios' }) nome: string;
  @ApiPropertyOptional({ nullable: true, example: 3.81, description: 'Nulo quando não há leitura na última hora' }) valor: number | null;
  @ApiProperty({ example: 'm' }) unidade: string;
  @ApiProperty({ example: 2, description: 'Casas decimais para exibir' }) casas: number;
  @ApiPropertyOptional({ nullable: true, example: '+0,34 m/h' }) variacao: string | null;
  @ApiPropertyOptional({ nullable: true, example: 0.85, description: 'Preenchimento da barra, de 0 a 1' }) proporcao: number | null;
  @ApiProperty({ example: 'Arroio Olarias acima da cota' }) nota: string;
  @ApiProperty({ enum: ['grave', 'atencao', 'estavel', 'sem_dados'], description: 'Gravidade do alerta ativo da grandeza, estável sem alerta' })
  estado: string;
}

export class PontoHoraDto {
  @ApiProperty({ example: 14 }) hora: number;
  @ApiPropertyOptional({ nullable: true, description: 'Acumulado de hoje até o fim da hora; nulo nas horas que ainda não chegaram' }) hoje: number | null;
  @ApiProperty({ description: 'Média do acumulado nas quatro semanas anteriores, no mesmo dia da semana' }) media: number;
}

export class BairroOcorrenciasDto {
  @ApiProperty({ example: 'Uvaranas' }) bairro: string;
  @ApiProperty({ example: 9 }) total: number;
}

export class PainelDto {
  @ApiProperty({ type: [IndicadorDto] }) indicadores: IndicadorDto[];
  @ApiProperty({ type: [PontoHoraDto] }) ocorrenciasHoje: PontoHoraDto[];
  @ApiProperty({ type: [BairroOcorrenciasDto], description: 'Cinco bairros com mais ocorrências nas últimas 24 horas' }) ocorrenciasPorBairro: BairroOcorrenciasDto[];
}

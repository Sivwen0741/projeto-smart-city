import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PontoSerieDto {
  @ApiProperty() dataHora: string;
  @ApiProperty() valor: number;
}

export class DiaVazaoDto {
  @ApiProperty({ example: '2026-10-25' }) data: string;
  @ApiProperty({ example: 18.4 }) valor: number;
}

export class CotaDto {
  @ApiProperty({ example: 3.5 }) valor: number;
  @ApiProperty({ example: '>' }) operador: string;
  @ApiProperty({ example: 'Nível do arroio acima da cota' }) regra: string;
}

export class PontoRioDto {
  @ApiProperty() dispositivoId: string;
  @ApiProperty({ example: 'SN-014' }) identificador: string;
  @ApiProperty({ example: 'Arroio Olarias', description: 'Primeiro trecho do endereço do sensor' }) nome: string;
  @ApiPropertyOptional({ nullable: true, example: 'ponte da Av. Visconde de Taunay' }) complemento: string | null;
  @ApiPropertyOptional({ nullable: true }) bairro: string | null;
  @ApiProperty({ enum: ['operando', 'sem_comunicacao', 'manutencao', 'inativo'] }) situacao: string;
  @ApiProperty() simulado: boolean;
  @ApiPropertyOptional({ nullable: true, description: 'Gravidade do alerta ativo de nível do sensor' }) alertaAtivo: string | null;
  @ApiPropertyOptional({ type: PontoSerieDto, nullable: true, description: 'Última leitura do sensor' }) nivel: PontoSerieDto | null;
  @ApiPropertyOptional({ nullable: true, description: 'Variação do nível em relação à leitura de uma hora atrás' }) tendencia: number | null;
  @ApiProperty({ type: [PontoSerieDto], description: 'Média por 10 min nas últimas 6 horas' }) serieNivel: PontoSerieDto[];
  @ApiPropertyOptional({ type: DiaVazaoDto, nullable: true, description: 'Vazão de hoje no Open-Meteo' }) vazao: DiaVazaoDto | null;
  @ApiProperty({ type: [DiaVazaoDto], description: 'Vazão diária dos últimos 7 dias' }) serieVazao: DiaVazaoDto[];
  @ApiProperty({ type: [DiaVazaoDto], description: 'Previsão de vazão dos próximos dias' }) previsao: DiaVazaoDto[];
}

export class ColetaDto {
  @ApiPropertyOptional({ nullable: true, description: 'Última coleta que deu certo' }) ultimaColeta: string | null;
  @ApiPropertyOptional({ nullable: true }) ultimaTentativa: string | null;
  @ApiPropertyOptional({ nullable: true, description: 'Erro da última tentativa, se falhou' }) erro: string | null;
}

export class RiosDto {
  @ApiPropertyOptional({ type: CotaDto, nullable: true, description: 'Menor limite das regras ativas de nível de água' }) cota: CotaDto | null;
  @ApiProperty({ type: ColetaDto }) coleta: ColetaDto;
  @ApiProperty({ type: [PontoRioDto] }) pontos: PontoRioDto[];
}

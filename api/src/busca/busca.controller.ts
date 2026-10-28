import { Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BuscaService } from './busca.service';
import { BuscarDto, ResultadoBuscaDto } from './dto/busca.dto';

@ApiTags('busca')
@ApiBearerAuth()
@Controller('busca')
export class BuscaController {
  constructor(private readonly busca: BuscaService) {}

  @Get()
  @ApiOperation({ summary: 'Busca do cabeçalho: ocorrências por protocolo, endereço ou bairro e dispositivos por código, endereço ou bairro, sem diferenciar maiúsculas nem acentos' })
  @ApiOkResponse({ type: ResultadoBuscaDto })
  @ApiBadRequestResponse({ description: 'Texto com menos de três caracteres' })
  buscar(@Query() consulta: BuscarDto): Promise<ResultadoBuscaDto> {
    return this.busca.buscar(consulta.q);
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OcorrenciaDto } from './dto/ocorrencia.dto';
import { OcorrenciasService } from './ocorrencias.service';

@ApiTags('ocorrências')
@ApiBearerAuth()
@Controller('ocorrencias')
export class OcorrenciasController {
  constructor(private readonly ocorrencias: OcorrenciasService) {}

  @Get()
  @ApiOperation({ summary: 'Ocorrências ainda não encerradas, da mais grave para a menos grave' })
  @ApiOkResponse({ type: [OcorrenciaDto] })
  listar(): Promise<OcorrenciaDto[]> {
    return this.ocorrencias.listarAbertas();
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OcorrenciaDto } from './dto/ocorrencia.dto';

const CONSULTA = `
  SELECT o.id::text AS id, o.protocolo, o.categoria, o.descricao, o.criticidade, o.situacao,
         ST_Y(o.localizacao::geometry) AS latitude, ST_X(o.localizacao::geometry) AS longitude,
         b.nome AS bairro, o.data_abertura AS "dataAbertura"
    FROM ocorrencia o
    LEFT JOIN bairro b ON b.id = o.bairro_id`;

@Injectable()
export class OcorrenciasService {
  constructor(private readonly fonte: DataSource) {}

  listarAbertas(): Promise<OcorrenciaDto[]> {
    return this.fonte.query(
      `${CONSULTA} WHERE o.data_encerramento IS NULL
        ORDER BY array_position(ARRAY['grave', 'atencao', 'informativo'], o.criticidade::text), o.data_abertura DESC`,
    );
  }
}

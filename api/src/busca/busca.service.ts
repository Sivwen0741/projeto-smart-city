import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SITUACAO } from '../dispositivos/dispositivos.service';
import { DispositivoEncontradoDto, OcorrenciaEncontradaDto, ResultadoBuscaDto } from './dto/busca.dto';

const LIMITE = 8;

const contem = (coluna: string) => `unaccent(${coluna}) ILIKE '%' || unaccent($1) || '%' ESCAPE '\\'`;

const OCORRENCIAS = `
  SELECT o.id::text AS id, o.protocolo, o.categoria, o.criticidade, o.situacao, o.endereco, b.nome AS bairro
    FROM ocorrencia o
    LEFT JOIN bairro b ON b.id = o.bairro_id
   WHERE ${contem('o.protocolo')} OR ${contem('o.endereco')} OR ${contem('b.nome')}
   ORDER BY (o.situacao IN ('aberta', 'em_atendimento')) DESC, o.data_abertura DESC
   LIMIT ${LIMITE}`;

const DISPOSITIVOS = `
  SELECT d.id::text AS id, d.identificador, t.nome AS tipo, ${SITUACAO} AS situacao, d.endereco, b.nome AS bairro, di.nome AS distrito
    FROM dispositivo d
    JOIN tipo_dispositivo t ON t.id = d.tipo_dispositivo_id
    LEFT JOIN bairro b ON b.id = d.bairro_id
    LEFT JOIN LATERAL (
      SELECT nome FROM distrito WHERE d.bairro_id IS NULL AND ST_Contains(area, d.localizacao::geometry) ORDER BY id LIMIT 1
    ) di ON true
   WHERE ${contem('d.identificador')} OR ${contem('d.endereco')} OR ${contem('b.nome')} OR ${contem('di.nome')}
   ORDER BY upper(d.identificador)
   LIMIT ${LIMITE}`;

@Injectable()
export class BuscaService {
  constructor(private readonly fonte: DataSource) {}

  async buscar(texto: string): Promise<ResultadoBuscaDto> {
    const termo = texto.replace(/[\\%_]/g, (c) => `\\${c}`);
    const [ocorrencias, dispositivos] = await Promise.all([
      this.fonte.query(OCORRENCIAS, [termo]) as Promise<OcorrenciaEncontradaDto[]>,
      this.fonte.query(DISPOSITIVOS, [termo]) as Promise<DispositivoEncontradoDto[]>,
    ]);
    return { ocorrencias, dispositivos };
  }
}

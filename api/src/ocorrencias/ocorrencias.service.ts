import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Subject } from 'rxjs';
import { DataSource, EntityManager } from 'typeorm';
import { Autor, DispositivosService } from '../dispositivos/dispositivos.service';
import { LogAtividadeService } from '../log-atividade/log-atividade.service';
import { CriarOcorrenciaDto, OcorrenciaDto, OrgaoDto } from './dto/ocorrencia.dto';

const CONSULTA = `
  SELECT o.id::text AS id, o.protocolo, o.categoria, o.descricao, o.criticidade, o.situacao, o.origem,
         ST_Y(o.localizacao::geometry) AS latitude, ST_X(o.localizacao::geometry) AS longitude,
         o.endereco, b.nome AS bairro, o.orgao_id::text AS "orgaoId", og.nome AS orgao,
         u.nome AS "registradaPor", o.data_abertura AS "dataAbertura"
    FROM ocorrencia o
    LEFT JOIN bairro b ON b.id = o.bairro_id
    LEFT JOIN orgao og ON og.id = o.orgao_id
    LEFT JOIN usuario u ON u.id = o.usuario_abertura_id`;

@Injectable()
export class OcorrenciasService {
  // avisa o tempo real depois do commit, como os alertas
  readonly novas = new Subject<OcorrenciaDto>();

  constructor(
    private readonly fonte: DataSource,
    private readonly dispositivos: DispositivosService,
    private readonly log: LogAtividadeService,
  ) {}

  listarAbertas(): Promise<OcorrenciaDto[]> {
    return this.fonte.query(
      `${CONSULTA} WHERE o.data_encerramento IS NULL
        ORDER BY array_position(ARRAY['grave', 'atencao', 'informativo'], o.criticidade::text), o.data_abertura DESC`,
    );
  }

  orgaos(): Promise<OrgaoDto[]> {
    return this.fonte.query(`SELECT id::text AS id, nome, sigla FROM orgao ORDER BY nome`);
  }

  async buscar(id: string, manager: EntityManager = this.fonte.manager): Promise<OcorrenciaDto> {
    const [ocorrencia] = await manager.query(`${CONSULTA} WHERE o.id = $1`, [id]);
    if (!ocorrencia) throw new NotFoundException('Ocorrência não encontrada.');
    return ocorrencia;
  }

  async criar(dados: CriarOcorrenciaDto, autor: Autor): Promise<OcorrenciaDto> {
    const criada = await this.fonte.transaction(async (m) => {
      const local = await this.dispositivos.localizar(dados.latitude, dados.longitude, m);
      if (dados.orgaoId) {
        const [orgao] = await m.query(`SELECT 1 FROM orgao WHERE id = $1`, [dados.orgaoId]);
        if (!orgao) throw new BadRequestException(['Órgão inválido.']);
      }
      const origem = dados.alertaId ? 'alerta' : 'telefone';
      const [{ id, protocolo }] = await m.query(
        `INSERT INTO ocorrencia
           (protocolo, categoria, descricao, criticidade, situacao, origem, localizacao, endereco, bairro_id, orgao_id, usuario_abertura_id)
         VALUES (to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-') || lpad(nextval('ocorrencia_protocolo_seq')::text, 4, '0'),
                 $1, $2, $3, 'aberta', $4, ST_SetSRID(ST_MakePoint($6, $5), 4326)::geography, $7, $8, $9, $10)
         RETURNING id::text, protocolo`,
        [dados.categoria, dados.descricao ?? null, dados.criticidade, origem, dados.latitude, dados.longitude, dados.endereco ?? null, local.bairroId, dados.orgaoId ?? null, autor.usuarioId],
      );
      if (dados.alertaId) await this.vincularAlerta(m, dados.alertaId, id);
      await m.query(
        `INSERT INTO historico_ocorrencia (ocorrencia_id, usuario_id, situacao_anterior, situacao_nova, observacao)
         VALUES ($1, $2, NULL, 'aberta', $3)`,
        [id, autor.usuarioId, dados.alertaId ? 'Ocorrência aberta a partir do alerta.' : 'Ocorrência registrada a partir de ligação telefônica.'],
      );
      await this.log.registrar(
        {
          usuarioId: autor.usuarioId,
          acao: 'registro_ocorrencia',
          entidadeAfetada: 'ocorrencia',
          entidadeId: id,
          detalhes: { protocolo, origem, alertaId: dados.alertaId ?? null },
          enderecoIp: autor.enderecoIp,
        },
        m,
      );
      return this.buscar(id, m);
    });
    this.novas.next(criada);
    return criada;
  }

  private async vincularAlerta(m: EntityManager, alertaId: string, ocorrenciaId: string): Promise<void> {
    const [linhas]: [{ id: string }[], number] = await m.query(
      `UPDATE alerta SET ocorrencia_id = $2 WHERE id = $1 AND ocorrencia_id IS NULL RETURNING id::text`,
      [alertaId, ocorrenciaId],
    );
    if (linhas.length > 0) return;
    const [existente] = await m.query(
      `SELECT o.protocolo FROM alerta a LEFT JOIN ocorrencia o ON o.id = a.ocorrencia_id WHERE a.id = $1`,
      [alertaId],
    );
    if (!existente) throw new NotFoundException('Alerta não encontrado.');
    throw new ConflictException(`Este alerta já está vinculado à ocorrência ${existente.protocolo}.`);
  }
}

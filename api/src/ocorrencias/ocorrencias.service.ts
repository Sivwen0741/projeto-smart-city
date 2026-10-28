import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Subject } from 'rxjs';
import { DataSource, EntityManager } from 'typeorm';
import { Autor, DispositivosService } from '../dispositivos/dispositivos.service';
import { LogAtividadeService } from '../log-atividade/log-atividade.service';
import { unidadeDaGrandeza as unidade } from '../grandezas';
import {
  AtualizarOcorrenciaDto,
  CriarOcorrenciaDto,
  DetalheOcorrenciaDto,
  OcorrenciaDto,
  OrgaoDto,
  RegistroHistoricoDto,
  VisaoOcorrencia,
} from './dto/ocorrencia.dto';

const CONSULTA = `
  SELECT o.id::text AS id, o.protocolo, o.categoria, o.descricao, o.criticidade, o.situacao, o.origem,
         ST_Y(o.localizacao::geometry) AS latitude, ST_X(o.localizacao::geometry) AS longitude,
         o.endereco, b.nome AS bairro, o.orgao_id::text AS "orgaoId", og.nome AS orgao,
         u.nome AS "registradaPor", o.data_abertura AS "dataAbertura", o.data_encerramento AS "dataEncerramento"
    FROM ocorrencia o
    LEFT JOIN bairro b ON b.id = o.bairro_id
    LEFT JOIN orgao og ON og.id = o.orgao_id
    LEFT JOIN usuario u ON u.id = o.usuario_abertura_id`;

const ORDEM: Record<VisaoOcorrencia, string> = {
  andamento: `WHERE o.situacao IN ('aberta', 'em_atendimento')
    ORDER BY o.situacao = 'em_atendimento', array_position(ARRAY['grave', 'atencao', 'informativo'], o.criticidade::text), o.data_abertura`,
  encerradas: `WHERE o.situacao = 'encerrada' AND o.data_encerramento >= now() - interval '30 days'
    ORDER BY o.data_encerramento DESC`,
};

// os alertas vinculados entram no histórico como no protótipo: gerado e reconhecido
const HISTORICO = `
  SELECT 'ocorrencia' AS tipo, h.data_hora AS "dataHora", h.situacao_anterior AS "situacaoAnterior",
         h.situacao_nova AS "situacaoNova", h.observacao, u.nome AS autor, og.nome AS "orgaoAutor", NULL::json AS alerta, h.id AS ordem
    FROM historico_ocorrencia h
    LEFT JOIN usuario u ON u.id = h.usuario_id
    LEFT JOIN orgao og ON og.id = u.orgao_id
   WHERE h.ocorrencia_id = $1
  UNION ALL
  SELECT 'alerta_gerado', a.data_hora, NULL, NULL, NULL, NULL, NULL,
         json_build_object('regra', r.nome, 'dispositivo', d.identificador, 'valorObservado', a.valor_observado::float8,
                           'valorLimite', a.valor_limite::float8, 'operador', a.operador, 'tipoGrandeza', r.tipo_grandeza), 0
    FROM alerta a JOIN regra_alerta r ON r.id = a.regra_alerta_id JOIN dispositivo d ON d.id = a.dispositivo_id
   WHERE a.ocorrencia_id = $1
  UNION ALL
  SELECT 'alerta_reconhecido', a.data_reconhecimento, NULL, NULL, a.providencia, u.nome, og.nome,
         json_build_object('regra', r.nome, 'dispositivo', d.identificador, 'valorObservado', a.valor_observado::float8,
                           'valorLimite', a.valor_limite::float8, 'operador', a.operador, 'tipoGrandeza', r.tipo_grandeza), 0
    FROM alerta a JOIN regra_alerta r ON r.id = a.regra_alerta_id JOIN dispositivo d ON d.id = a.dispositivo_id
    LEFT JOIN usuario u ON u.id = a.usuario_reconhecimento_id
    LEFT JOIN orgao og ON og.id = u.orgao_id
   WHERE a.ocorrencia_id = $1 AND a.data_reconhecimento IS NOT NULL
  ORDER BY "dataHora", ordem`;

type AlertaNoHistorico = Omit<NonNullable<RegistroHistoricoDto['alerta']>, 'unidade'> & { tipoGrandeza: string };

@Injectable()
export class OcorrenciasService {
  // avisa o tempo real depois do commit, como os alertas
  readonly novas = new Subject<OcorrenciaDto>();
  readonly atualizadas = new Subject<OcorrenciaDto>();

  constructor(
    private readonly fonte: DataSource,
    private readonly dispositivos: DispositivosService,
    private readonly log: LogAtividadeService,
  ) {}

  listar(visao: VisaoOcorrencia = 'andamento'): Promise<OcorrenciaDto[]> {
    return this.fonte.query(`${CONSULTA} ${ORDEM[visao]}`);
  }

  async detalhe(id: string): Promise<DetalheOcorrenciaDto> {
    if (!/^\d+$/.test(id)) throw new NotFoundException('Ocorrência não encontrada.');
    const ocorrencia = await this.buscar(id);
    const registros: (Omit<RegistroHistoricoDto, 'alerta'> & { alerta: AlertaNoHistorico | null; ordem?: string })[] =
      await this.fonte.query(HISTORICO, [id]);
    const historico = registros.map(({ ordem, alerta, ...r }) => {
      if (!alerta) return { ...r, alerta: null };
      const { tipoGrandeza, ...resto } = alerta;
      return { ...r, alerta: { ...resto, unidade: unidade(tipoGrandeza) } };
    });
    const alertas = await this.fonte.query(
      `SELECT a.id::text AS id, r.nome AS regra, d.identificador AS dispositivo, a.criticidade, a.situacao,
              a.valor_observado::float8 AS "valorObservado", r.tipo_grandeza AS "tipoGrandeza", a.data_hora AS "dataHora"
         FROM alerta a JOIN regra_alerta r ON r.id = a.regra_alerta_id JOIN dispositivo d ON d.id = a.dispositivo_id
        WHERE a.ocorrencia_id = $1
        ORDER BY a.data_hora DESC`,
      [id],
    );
    const providencias = historico.filter((h) => h.tipo === 'ocorrencia' && h.situacaoAnterior !== null);
    return {
      ...ocorrencia,
      responsavel: providencias.at(-1)?.autor ?? null,
      historico,
      alertas: alertas.map(({ tipoGrandeza, ...a }: { tipoGrandeza: string }) => ({ ...a, unidade: unidade(tipoGrandeza) })),
    };
  }

  async atualizar(id: string, dados: AtualizarOcorrenciaDto, autor: Autor): Promise<{ ocorrencia: OcorrenciaDto; alertasEncerrados: string[] }> {
    if (!/^\d+$/.test(id)) throw new NotFoundException('Ocorrência não encontrada.');
    const resultado = await this.fonte.transaction(async (m) => {
      const [atual] = await m.query(`SELECT situacao, protocolo FROM ocorrencia WHERE id = $1 FOR UPDATE`, [id]);
      if (!atual) throw new NotFoundException('Ocorrência não encontrada.');
      if (atual.situacao === 'encerrada') throw new ConflictException(`A ocorrência ${atual.protocolo} já foi encerrada.`);
      const nova = dados.situacao ?? (atual.situacao === 'aberta' ? 'em_atendimento' : atual.situacao);
      const encerrando = nova === 'encerrada';

      await m.query(
        `UPDATE ocorrencia SET situacao = $2, data_encerramento = CASE WHEN $3::boolean THEN now() END WHERE id = $1`,
        [id, nova, encerrando],
      );
      await m.query(
        `INSERT INTO historico_ocorrencia (ocorrencia_id, usuario_id, situacao_anterior, situacao_nova, observacao)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, autor.usuarioId, atual.situacao, nova, dados.observacao],
      );
      let alertasEncerrados: string[] = [];
      if (encerrando) {
        const [linhas]: [{ id: string }[], number] = await m.query(
          `UPDATE alerta SET situacao = 'encerrado', data_encerramento = now()
            WHERE ocorrencia_id = $1 AND situacao = 'em_atendimento' RETURNING id::text`,
          [id],
        );
        alertasEncerrados = linhas.map((l) => l.id);
      }
      await this.log.registrar(
        {
          usuarioId: autor.usuarioId,
          acao: encerrando ? 'encerramento_ocorrencia' : 'atualizacao_ocorrencia',
          entidadeAfetada: 'ocorrencia',
          entidadeId: id,
          detalhes: { protocolo: atual.protocolo, situacaoAnterior: atual.situacao, situacaoNova: nova, alertasEncerrados },
          enderecoIp: autor.enderecoIp,
        },
        m,
      );
      return { ocorrencia: await this.buscar(id, m), alertasEncerrados };
    });
    this.atualizadas.next(resultado.ocorrencia);
    return resultado;
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

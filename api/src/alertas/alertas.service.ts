import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Autor } from '../dispositivos/dispositivos.service';
import { LogAtividadeService } from '../log-atividade/log-atividade.service';
import { SITUACAO } from '../dispositivos/dispositivos.service';
import { GRANDEZAS } from '../grandezas';
import { AlertaDto, ResumoAlertasDto, Visao } from './dto/alerta.dto';

const CONSULTA = `
  SELECT a.id::text AS id, r.id::text AS "regraId", r.nome AS regra, r.tipo_grandeza AS "tipoGrandeza",
         d.id::text AS "dispositivoId", d.identificador AS dispositivo, t.nome AS "tipoDispositivo",
         d.endereco, b.nome AS bairro,
         a.valor_observado::float8 AS "valorObservado", a.operador, a.valor_limite::float8 AS "valorLimite",
         a.criticidade, a.situacao, a.data_hora AS "dataHora", a.data_reconhecimento AS "dataReconhecimento",
         u.nome AS "reconhecidoPor", a.providencia, a.data_encerramento AS "dataEncerramento",
         og.nome AS orgao, a.ocorrencia_id::text AS "ocorrenciaId"
    FROM alerta a
    JOIN regra_alerta r ON r.id = a.regra_alerta_id
    JOIN dispositivo d ON d.id = a.dispositivo_id
    JOIN tipo_dispositivo t ON t.id = d.tipo_dispositivo_id
    LEFT JOIN bairro b ON b.id = d.bairro_id
    LEFT JOIN usuario u ON u.id = a.usuario_reconhecimento_id
    LEFT JOIN ocorrencia o ON o.id = a.ocorrencia_id
    LEFT JOIN orgao og ON og.id = o.orgao_id`;

const FILTRO: Record<Visao, string> = {
  ativos: `a.situacao IN ('aberto', 'em_atendimento')`,
  em_atendimento: `a.situacao = 'em_atendimento'`,
  encerrados_hoje: `a.situacao = 'encerrado' AND a.data_encerramento >= date_trunc('day', now())`,
};

// us28: o grave sem reconhecimento fica acima de tudo, inclusive de um grave já em atendimento
const GRAVE_SEM_RECONHECIMENTO = `(a.criticidade = 'grave' AND a.situacao = 'aberto')`;

export const ORDEM_GRAVIDADE = `array_position(ARRAY['grave', 'atencao', 'informativo'], a.criticidade::text)`;

const hora = (instante: string | Date | null) =>
  instante
    ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(instante))
    : '';

const comUnidade = (a: Omit<AlertaDto, 'unidade'>): AlertaDto => ({
  ...a,
  unidade: GRANDEZAS[a.tipoGrandeza as keyof typeof GRANDEZAS]?.unidade ?? null,
});

@Injectable()
export class AlertasService {
  constructor(
    private readonly fonte: DataSource,
    private readonly log: LogAtividadeService,
  ) {}

  async listar(visao: Visao = 'ativos'): Promise<AlertaDto[]> {
    const alertas: Omit<AlertaDto, 'unidade'>[] = await this.fonte.query(
      `${CONSULTA} WHERE ${FILTRO[visao]} ORDER BY ${GRAVE_SEM_RECONHECIMENTO} DESC, ${ORDEM_GRAVIDADE}, a.data_hora DESC, a.id DESC`,
    );
    return alertas.map(comUnidade);
  }

  async buscar(id: string): Promise<AlertaDto | null> {
    const [alerta] = await this.fonte.query(`${CONSULTA} WHERE a.id = $1`, [id]);
    return alerta ? comUnidade(alerta) : null;
  }

  // o update condicional garante um só reconhecimento, mesmo com dois operadores ao mesmo tempo
  async reconhecer(id: string, providencia: string, autor: Autor): Promise<AlertaDto> {
    if (!/^\d+$/.test(id)) throw new NotFoundException('Alerta não encontrado.');
    const reconhecido = await this.fonte.transaction(async (m) => {
      const [linhas]: [{ id: string }[], number] = await m.query(
        `UPDATE alerta
            SET situacao = 'em_atendimento', usuario_reconhecimento_id = $2, data_reconhecimento = now(), providencia = $3
          WHERE id = $1 AND situacao = 'aberto'
          RETURNING id::text`,
        [id, autor.usuarioId, providencia],
      );
      if (linhas.length === 0) return false;
      await this.log.registrar(
        {
          usuarioId: autor.usuarioId,
          acao: 'reconhecimento_alerta',
          entidadeAfetada: 'alerta',
          entidadeId: id,
          detalhes: { providencia },
          enderecoIp: autor.enderecoIp,
        },
        m,
      );
      return true;
    });
    const alerta = await this.buscar(id);
    if (!alerta) throw new NotFoundException('Alerta não encontrado.');
    if (!reconhecido) {
      const mensagem =
        alerta.situacao === 'encerrado'
          ? 'Este alerta já foi encerrado. A sua providência não foi gravada.'
          : `Este alerta já foi reconhecido por ${alerta.reconhecidoPor ?? 'outro operador'} às ${hora(alerta.dataReconhecimento)}. A sua providência não foi gravada.`;
      throw new ConflictException({ statusCode: 409, error: 'Conflict', message: mensagem, alerta });
    }
    return alerta;
  }

  async resumo(): Promise<ResumoAlertasDto> {
    const [contagens] = await this.fonte.query(
      `SELECT count(*) FILTER (WHERE situacao IN ('aberto', 'em_atendimento'))::int AS ativos,
              count(*) FILTER (WHERE situacao = 'aberto' AND criticidade = 'grave')::int AS "gravesSemReconhecimento",
              count(*) FILTER (WHERE situacao = 'em_atendimento')::int AS "emAtendimento",
              count(*) FILTER (WHERE situacao = 'encerrado' AND data_encerramento >= date_trunc('day', now()))::int AS "encerradosHoje",
              round((avg(extract(epoch FROM data_reconhecimento - data_hora))
                       FILTER (WHERE data_reconhecimento >= now() - interval '24 hours') / 60)::numeric, 1)::float8
                AS "tempoMedioReconhecimentoMinutos",
              count(*) FILTER (WHERE data_hora >= now() - interval '24 hours')::int AS "ultimas24h",
              count(*) FILTER (WHERE data_hora >= now() - interval '24 hours' AND situacao = 'encerrado')::int AS "encerradosUltimas24h"
         FROM alerta`,
    );
    const porTipo: { tipo: string; quantidade: number }[] = await this.fonte.query(
      `SELECT t.nome AS tipo, count(*)::int AS quantidade
         FROM dispositivo d JOIN tipo_dispositivo t ON t.id = d.tipo_dispositivo_id
        WHERE ${SITUACAO} = 'sem_comunicacao'
        GROUP BY t.nome ORDER BY count(*) DESC, t.nome`,
    );
    const [maisAntigo] = await this.fonte.query(
      `${CONSULTA} WHERE ${GRAVE_SEM_RECONHECIMENTO} ORDER BY a.data_hora, a.id LIMIT 1`,
    );
    return {
      ...contagens,
      graveMaisAntigo: maisAntigo ? comUnidade(maisAntigo) : null,
      semComunicacao: porTipo.reduce((soma, p) => soma + p.quantidade, 0),
      semComunicacaoPorTipo: porTipo,
    };
  }
}

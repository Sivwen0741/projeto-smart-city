import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Autor } from '../dispositivos/dispositivos.service';
import { LogAtividadeService } from '../log-atividade/log-atividade.service';
import { AlteracaoRegraDto, AtualizarRegraAlertaDto, CriarRegraAlertaDto, RegraAlertaDto } from './dto/regra-alerta.dto';

const CONSULTA = `
  SELECT r.id::text AS id, r.nome, r.tipo_grandeza AS "tipoGrandeza", r.operador,
         r.valor_limite::float8 AS "valorLimite", r.duracao_minutos AS "duracaoMinutos",
         r.criticidade, r.ativa,
         (SELECT count(*) FROM alerta a WHERE a.regra_alerta_id = r.id)::int AS alertas
    FROM regra_alerta r`;

const MENSAGEM_VAZIO: Record<string, string> = {
  nome: 'Informe o nome da regra.',
  tipoGrandeza: 'Escolha a grandeza observada.',
  operador: 'Escolha o operador de comparação.',
  valorLimite: 'Informe o valor limite.',
  duracaoMinutos: 'Informe a duração mínima em minutos inteiros.',
  criticidade: 'Escolha a gravidade.',
  ativa: 'Ativa deve ser verdadeiro ou falso.',
};

const CAMPOS = ['nome', 'tipoGrandeza', 'operador', 'valorLimite', 'duracaoMinutos', 'criticidade', 'ativa'] as const;

@Injectable()
export class RegrasAlertaService {
  constructor(
    private readonly fonte: DataSource,
    private readonly log: LogAtividadeService,
  ) {}

  listar(): Promise<RegraAlertaDto[]> {
    return this.fonte.query(`${CONSULTA} ORDER BY r.ativa DESC, array_position(ARRAY['grave', 'atencao', 'informativo'], r.criticidade::text), r.nome`);
  }

  async buscar(id: string, manager: EntityManager = this.fonte.manager): Promise<RegraAlertaDto> {
    if (!/^\d+$/.test(id)) throw new NotFoundException('Regra de alerta não encontrada.');
    const [regra] = await manager.query(`${CONSULTA} WHERE r.id = $1`, [id]);
    if (!regra) throw new NotFoundException('Regra de alerta não encontrada.');
    return regra;
  }

  criar(dados: CriarRegraAlertaDto, autor: Autor): Promise<RegraAlertaDto> {
    return this.fonte.transaction(async (m) => {
      const [{ id }] = await m.query(
        `INSERT INTO regra_alerta (nome, tipo_grandeza, operador, valor_limite, duracao_minutos, criticidade, ativa)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id::text`,
        [dados.nome, dados.tipoGrandeza, dados.operador, dados.valorLimite, dados.duracaoMinutos, dados.criticidade, dados.ativa ?? true],
      );
      const criada = await this.buscar(id, m);
      await this.log.registrar(
        {
          usuarioId: autor.usuarioId,
          acao: 'cadastro_regra_alerta',
          entidadeAfetada: 'regra_alerta',
          entidadeId: id,
          detalhes: { depois: this.auditavel(criada) },
          enderecoIp: autor.enderecoIp,
        },
        m,
      );
      return criada;
    });
  }

  async atualizar(id: string, dados: AtualizarRegraAlertaDto, autor: Autor): Promise<RegraAlertaDto> {
    // na edição os campos são opcionais, mas nulo é tentativa de apagar um campo obrigatório
    const vazios = Object.entries(dados).filter(([, v]) => v === null).map(([campo]) => MENSAGEM_VAZIO[campo]);
    if (vazios.length > 0) throw new BadRequestException(vazios);
    const atual = await this.buscar(id);
    const novo = { ...this.auditavel(atual), ...Object.fromEntries(Object.entries(dados).filter(([, v]) => v !== undefined)) };

    return this.fonte.transaction(async (m) => {
      await m.query(
        `UPDATE regra_alerta
            SET nome = $2, tipo_grandeza = $3, operador = $4, valor_limite = $5, duracao_minutos = $6, criticidade = $7, ativa = $8
          WHERE id = $1`,
        [id, novo.nome, novo.tipoGrandeza, novo.operador, novo.valorLimite, novo.duracaoMinutos, novo.criticidade, novo.ativa],
      );
      const atualizada = await this.buscar(id, m);

      const antes: Record<string, unknown> = {};
      const depois: Record<string, unknown> = {};
      const a = this.auditavel(atual);
      const d = this.auditavel(atualizada);
      for (const campo of CAMPOS) {
        if (a[campo] !== d[campo]) {
          antes[campo] = a[campo];
          depois[campo] = d[campo];
        }
      }
      if (Object.keys(depois).length > 0) {
        await this.log.registrar(
          {
            usuarioId: autor.usuarioId,
            acao: 'edicao_regra_alerta',
            entidadeAfetada: 'regra_alerta',
            entidadeId: id,
            detalhes: { antes, depois },
            enderecoIp: autor.enderecoIp,
          },
          m,
        );
      }
      return atualizada;
    });
  }

  async alteracoes(id: string): Promise<AlteracaoRegraDto[]> {
    await this.buscar(id);
    return this.fonte.query(
      `SELECT l.acao, u.nome AS autor, l.data_hora AS "dataHora",
              l.detalhes->'antes' AS antes, l.detalhes->'depois' AS depois
         FROM log_atividade l
         LEFT JOIN usuario u ON u.id = l.usuario_id
        WHERE l.entidade_afetada = 'regra_alerta' AND l.entidade_id = $1
        ORDER BY l.data_hora DESC, l.id DESC`,
      [id],
    );
  }

  private auditavel(r: RegraAlertaDto): Record<(typeof CAMPOS)[number], unknown> {
    return Object.fromEntries(CAMPOS.map((campo) => [campo, r[campo]])) as Record<(typeof CAMPOS)[number], unknown>;
  }
}

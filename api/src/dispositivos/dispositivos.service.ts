import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { LogAtividadeService } from '../log-atividade/log-atividade.service';
import { CATEGORIAS, validarAtributos } from './atributos';
import {
  AtualizarDispositivoDto,
  CriarDispositivoDto,
  DispositivoDto,
  Estado,
  LeituraDto,
  LocalDto,
  Ordenacao,
  TipoDispositivoDto,
} from './dto/dispositivo.dto';

// último recurso quando nem o dispositivo nem o tipo informam intervalo (docs/decisoes/2026-10-22-situacao-sem-comunicacao.md)
export const LIMITE_SEM_INTERVALO_SEGUNDOS = 30 * 60;

const LIMITE_COMUNICACAO = `COALESCE(2 * COALESCE((d.atributos_especificos->>'intervaloLeituraSegundos')::int, t.intervalo_leitura_segundos), ${LIMITE_SEM_INTERVALO_SEGUNDOS})`;

const SITUACAO = `CASE
    WHEN d.estado = 'inativo' THEN 'inativo'
    WHEN d.estado = 'manutencao' THEN 'manutencao'
    WHEN d.ultima_comunicacao IS NULL
      OR d.ultima_comunicacao < now() - ${LIMITE_COMUNICACAO} * interval '1 second' THEN 'sem_comunicacao'
    ELSE 'operando'
  END`;

const CONSULTA = `
  SELECT d.id::text                                AS id,
         d.identificador,
         d.tipo_dispositivo_id::text               AS "tipoDispositivoId",
         t.nome                                    AS tipo,
         t.categoria,
         d.descricao,
         d.endereco,
         ST_Y(d.localizacao::geometry)             AS latitude,
         ST_X(d.localizacao::geometry)             AS longitude,
         d.bairro_id::text                         AS "bairroId",
         b.nome                                    AS bairro,
         di.nome                                   AS distrito,
         to_char(d.data_instalacao, 'YYYY-MM-DD')  AS "dataInstalacao",
         d.estado,
         ${SITUACAO}                               AS situacao,
         d.ultima_comunicacao                      AS "ultimaComunicacao",
         ${LIMITE_COMUNICACAO}                     AS "limiteComunicacaoSegundos",
         d.atributos_especificos                   AS atributos
    FROM dispositivo d
    JOIN tipo_dispositivo t ON t.id = d.tipo_dispositivo_id
    LEFT JOIN bairro b ON b.id = d.bairro_id
    LEFT JOIN LATERAL (
      SELECT nome FROM distrito WHERE ST_Contains(area, d.localizacao::geometry) ORDER BY id LIMIT 1
    ) di ON true`;

const ORDEM_SITUACAO = `array_position(ARRAY['operando', 'sem_comunicacao', 'manutencao', 'inativo'], ${SITUACAO})`;

const ORDENACAO: Record<Ordenacao, (direcao: string) => string> = {
  codigo: (dir) => `upper(d.identificador) ${dir}`,
  tipo: (dir) => `t.nome ${dir}, upper(d.identificador)`,
  localizacao: (dir) => `coalesce(b.nome, di.nome) ${dir}, d.endereco ${dir} NULLS LAST, upper(d.identificador)`,
  situacao: (dir) => `${ORDEM_SITUACAO} ${dir}, upper(d.identificador)`,
  // crescente = comunicação mais recente primeiro, como "há 3 s" antes de "há 2 min"
  comunicacao: (dir) => `d.ultima_comunicacao ${dir === 'ASC' ? 'DESC' : 'ASC'} NULLS LAST, upper(d.identificador)`,
};

const CAMPOS_AUDITADOS = [
  'identificador',
  'tipoDispositivoId',
  'descricao',
  'endereco',
  'latitude',
  'longitude',
  'bairroId',
  'dataInstalacao',
  'estado',
  'atributos',
] as const;

export interface Autor {
  usuarioId: string;
  enderecoIp: string | null;
}

@Injectable()
export class DispositivosService {
  constructor(
    private readonly fonte: DataSource,
    private readonly log: LogAtividadeService,
  ) {}

  async listarTipos(): Promise<TipoDispositivoDto[]> {
    const tipos: { id: string; nome: string; categoria: string; intervalo: number | null }[] = await this.fonte.query(
      `SELECT id::text, nome, categoria, intervalo_leitura_segundos AS intervalo FROM tipo_dispositivo ORDER BY nome`,
    );
    return tipos.map((t) => ({
      id: t.id,
      nome: t.nome,
      categoria: t.categoria,
      rotuloCategoria: CATEGORIAS[t.categoria]?.rotulo ?? t.categoria,
      provisoria: CATEGORIAS[t.categoria]?.provisoria ?? true,
      intervaloLeituraSegundos: t.intervalo,
      campos: CATEGORIAS[t.categoria]?.campos ?? [],
    }));
  }

  async listar(ordem: Ordenacao = 'codigo', direcao: 'asc' | 'desc' = 'asc'): Promise<DispositivoDto[]> {
    const dir = direcao === 'desc' ? 'DESC' : 'ASC';
    return this.fonte.query(`${CONSULTA} ORDER BY ${ORDENACAO[ordem](dir)}`);
  }

  async buscar(id: string, manager: EntityManager = this.fonte.manager): Promise<DispositivoDto> {
    if (!/^\d+$/.test(id)) throw new NotFoundException('Dispositivo não encontrado.');
    const [dispositivo] = await manager.query(`${CONSULTA} WHERE d.id = $1`, [id]);
    if (!dispositivo) throw new NotFoundException('Dispositivo não encontrado.');
    return dispositivo;
  }

  async localizar(latitude: number, longitude: number, manager: EntityManager = this.fonte.manager): Promise<LocalDto> {
    const [local] = await manager.query(
      `WITH p AS (SELECT ST_SetSRID(ST_MakePoint($2, $1), 4326) AS g)
       SELECT b.id::text AS "bairroId", b.nome AS bairro, di.nome AS distrito
         FROM p
         JOIN LATERAL (SELECT nome FROM distrito WHERE ST_Contains(area, p.g) ORDER BY id LIMIT 1) di ON true
         LEFT JOIN LATERAL (SELECT id, nome FROM bairro WHERE ST_Contains(area, p.g) ORDER BY ST_Area(area) LIMIT 1) b ON true`,
      [latitude, longitude],
    );
    if (!local) throw new UnprocessableEntityException('A coordenada está fora do município de Ponta Grossa.');
    return local;
  }

  async criar(dados: CriarDispositivoDto, autor: Autor): Promise<DispositivoDto> {
    const categoria = await this.categoriaDoTipo(dados.tipoDispositivoId);
    const atributos = this.atributosValidos(categoria, dados.atributos);

    return this.comConflitoTratado(dados.identificador, () =>
      this.fonte.transaction(async (m) => {
        await this.recusarCodigoRepetido(dados.identificador, null, m);
        const local = await this.localizar(dados.latitude, dados.longitude, m);
        const [{ id }] = await m.query(
          `INSERT INTO dispositivo
             (identificador, tipo_dispositivo_id, descricao, endereco, localizacao, bairro_id, data_instalacao, estado, atributos_especificos)
           VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($6, $5), 4326)::geography, $7, $8, $9, $10)
           RETURNING id::text`,
          [
            dados.identificador,
            dados.tipoDispositivoId,
            dados.descricao ?? null,
            dados.endereco ?? null,
            dados.latitude,
            dados.longitude,
            local.bairroId,
            dados.dataInstalacao ?? null,
            dados.estado ?? 'ativo',
            atributos,
          ],
        );
        const criado = await this.buscar(id, m);
        await this.log.registrar(
          {
            usuarioId: autor.usuarioId,
            acao: 'cadastro_dispositivo',
            entidadeAfetada: 'dispositivo',
            entidadeId: id,
            detalhes: { depois: this.auditavel(criado) },
            enderecoIp: autor.enderecoIp,
          },
          m,
        );
        return criado;
      }),
    );
  }

  async atualizar(id: string, dados: AtualizarDispositivoDto, autor: Autor): Promise<DispositivoDto> {
    const atual = await this.buscar(id);
    const identificador = dados.identificador ?? atual.identificador;
    const tipoDispositivoId = dados.tipoDispositivoId ?? atual.tipoDispositivoId;
    const categoria = await this.categoriaDoTipo(tipoDispositivoId);
    const atributos = this.atributosValidos(categoria, dados.atributos ?? atual.atributos);
    const latitude = dados.latitude ?? atual.latitude;
    const longitude = dados.longitude ?? atual.longitude;
    const estado: Estado = dados.estado ?? atual.estado;

    return this.comConflitoTratado(identificador, () =>
      this.fonte.transaction(async (m) => {
        await this.recusarCodigoRepetido(identificador, id, m);
        const local = await this.localizar(latitude, longitude, m);
        await m.query(
          `UPDATE dispositivo
              SET identificador = $2, tipo_dispositivo_id = $3, descricao = $4, endereco = $5,
                  localizacao = ST_SetSRID(ST_MakePoint($7, $6), 4326)::geography, bairro_id = $8,
                  data_instalacao = $9, estado = $10, atributos_especificos = $11
            WHERE id = $1`,
          [
            id,
            identificador,
            tipoDispositivoId,
            dados.descricao !== undefined ? dados.descricao : atual.descricao,
            dados.endereco !== undefined ? dados.endereco : atual.endereco,
            latitude,
            longitude,
            local.bairroId,
            dados.dataInstalacao !== undefined ? dados.dataInstalacao : atual.dataInstalacao,
            estado,
            atributos,
          ],
        );
        const atualizado = await this.buscar(id, m);

        const antes: Record<string, unknown> = {};
        const depois: Record<string, unknown> = {};
        const a = this.auditavel(atual);
        const d = this.auditavel(atualizado);
        for (const campo of CAMPOS_AUDITADOS) {
          if (JSON.stringify(a[campo]) !== JSON.stringify(d[campo])) {
            antes[campo] = a[campo];
            depois[campo] = d[campo];
          }
        }
        if (Object.keys(depois).length > 0) {
          const inativou = atual.estado !== 'inativo' && estado === 'inativo';
          await this.log.registrar(
            {
              usuarioId: autor.usuarioId,
              acao: inativou ? 'inativacao_dispositivo' : 'edicao_dispositivo',
              entidadeAfetada: 'dispositivo',
              entidadeId: id,
              detalhes: { antes, depois },
              enderecoIp: autor.enderecoIp,
            },
            m,
          );
        }
        return atualizado;
      }),
    );
  }

  async leituras(id: string, limite = 100): Promise<LeituraDto[]> {
    await this.buscar(id);
    return this.fonte.query(
      `SELECT id::text, tipo_grandeza AS "tipoGrandeza", valor::float AS valor, unidade, origem, data_hora AS "dataHora"
         FROM leitura WHERE dispositivo_id = $1 ORDER BY data_hora DESC LIMIT $2`,
      [id, Math.min(limite, 1000)],
    );
  }

  private auditavel(d: DispositivoDto): Record<string, unknown> {
    return Object.fromEntries(CAMPOS_AUDITADOS.map((campo) => [campo, d[campo]]));
  }

  private async categoriaDoTipo(tipoDispositivoId: string): Promise<string> {
    const [tipo] = await this.fonte.query(`SELECT categoria FROM tipo_dispositivo WHERE id = $1`, [tipoDispositivoId]);
    if (!tipo) throw new BadRequestException(['Tipo de dispositivo inexistente.']);
    return tipo.categoria;
  }

  private atributosValidos(categoria: string, entrada: unknown): Record<string, unknown> {
    const { atributos, erros } = validarAtributos(categoria, entrada);
    if (erros.length > 0) throw new BadRequestException(erros);
    return atributos;
  }

  private async recusarCodigoRepetido(identificador: string, idAtual: string | null, m: EntityManager): Promise<void> {
    const [existente] = await m.query(
      `SELECT d.id::text AS id, d.identificador, t.nome AS tipo, coalesce(b.nome, di.nome) AS local
         FROM dispositivo d
         JOIN tipo_dispositivo t ON t.id = d.tipo_dispositivo_id
         LEFT JOIN bairro b ON b.id = d.bairro_id
         LEFT JOIN LATERAL (SELECT nome FROM distrito WHERE ST_Contains(area, d.localizacao::geometry) LIMIT 1) di ON true
        WHERE upper(d.identificador) = upper($1)`,
      [identificador],
    );
    if (existente && existente.id !== idAtual) {
      const onde = [existente.tipo, existente.local].filter(Boolean).join(', ');
      throw new ConflictException(`O código ${existente.identificador} já está cadastrado (${onde}). Informe outro código.`);
    }
  }

  // dois cadastros simultâneos com o mesmo código passam pela checagem; o índice único decide
  private async comConflitoTratado<T>(identificador: string, operacao: () => Promise<T>): Promise<T> {
    try {
      return await operacao();
    } catch (erro) {
      if ((erro as { code?: string }).code === '23505') {
        throw new ConflictException(`O código ${identificador} já está cadastrado. Informe outro código.`);
      }
      throw erro;
    }
  }
}

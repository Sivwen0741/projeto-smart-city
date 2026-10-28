import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { gerarHashSenha } from '../auth/senha';
import { Autor } from '../dispositivos/dispositivos.service';
import { LogAtividadeService } from '../log-atividade/log-atividade.service';
import { AtualizarUsuarioDto, CriarUsuarioDto, PerfilDto, UsuarioCriadoDto, UsuarioDto } from './dto/usuario.dto';

// sem caracteres que se confundem ao ditar ou copiar (0/o, 1/l/i)
const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';
const TAMANHO_SENHA = 12;

const CONSULTA = `
  SELECT u.id::text AS id, u.nome, u.email, u.orgao_id::text AS "orgaoId", o.nome AS orgao,
         u.perfil_id::text AS "perfilId", p.nome AS perfil, u.ativo, u.ultimo_acesso AS "ultimoAcesso"
    FROM usuario u
    JOIN orgao o ON o.id = u.orgao_id
    JOIN perfil p ON p.id = u.perfil_id`;

const CAMPOS_AUDITADOS = ['nome', 'email', 'orgao', 'perfil', 'ativo'] as const;

export function gerarSenhaProvisoria(): string {
  return Array.from({ length: TAMANHO_SENHA }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
}

@Injectable()
export class UsuariosService {
  constructor(
    private readonly fonte: DataSource,
    private readonly log: LogAtividadeService,
  ) {}

  listar(): Promise<UsuarioDto[]> {
    return this.fonte.query(`${CONSULTA} ORDER BY u.ativo DESC, lower(u.nome)`);
  }

  perfis(): Promise<PerfilDto[]> {
    return this.fonte.query(
      `SELECT p.id::text AS id, p.nome, p.descricao,
              COALESCE(array_agg(pm.codigo ORDER BY pm.id) FILTER (WHERE pm.id IS NOT NULL), '{}') AS permissoes
         FROM perfil p
         LEFT JOIN perfil_permissao pp ON pp.perfil_id = p.id
         LEFT JOIN permissao pm ON pm.id = pp.permissao_id
        GROUP BY p.id ORDER BY count(pm.id), p.nome`,
    );
  }

  async criar(dados: CriarUsuarioDto, autor: Autor): Promise<UsuarioCriadoDto> {
    const senhaProvisoria = gerarSenhaProvisoria();
    const hash = await gerarHashSenha(senhaProvisoria);
    const usuario = await this.fonte.transaction(async (m) => {
      await this.validarReferencias(m, dados.orgaoId, dados.perfilId);
      await this.validarEmailLivre(m, dados.email);
      const [{ id }] = await m.query(
        `INSERT INTO usuario (nome, email, orgao_id, perfil_id, senha_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id::text`,
        [dados.nome, dados.email, dados.orgaoId, dados.perfilId, hash],
      );
      const criado = await this.buscar(id, m);
      await this.log.registrar(
        { usuarioId: autor.usuarioId, acao: 'cadastro_usuario', entidadeAfetada: 'usuario', entidadeId: id, detalhes: { depois: auditavel(criado) }, enderecoIp: autor.enderecoIp },
        m,
      );
      return criado;
    });
    return { usuario, senhaProvisoria };
  }

  async atualizar(id: string, dados: AtualizarUsuarioDto, autor: Autor): Promise<UsuarioDto> {
    if (!/^\d+$/.test(id)) throw new NotFoundException('Usuário não encontrado.');
    return this.fonte.transaction(async (m) => {
      const antes = await this.buscar(id, m);
      if (id === autor.usuarioId && dados.ativo === false) throw new ConflictException('Você não pode inativar o próprio usuário.');
      if (id === autor.usuarioId && dados.perfilId && dados.perfilId !== antes.perfilId) {
        throw new ConflictException('Você não pode mudar o próprio perfil; peça a outro administrador.');
      }
      await this.validarReferencias(m, dados.orgaoId, dados.perfilId);
      if (dados.email && dados.email !== antes.email) await this.validarEmailLivre(m, dados.email);

      await m.query(
        `UPDATE usuario SET nome = COALESCE($2, nome), email = COALESCE($3, email), orgao_id = COALESCE($4::bigint, orgao_id),
                perfil_id = COALESCE($5::bigint, perfil_id), ativo = COALESCE($6::boolean, ativo)
          WHERE id = $1`,
        [id, dados.nome ?? null, dados.email ?? null, dados.orgaoId ?? null, dados.perfilId ?? null, dados.ativo ?? null],
      );
      const depois = await this.buscar(id, m);
      const a = auditavel(antes);
      const d = auditavel(depois);
      const mudou = CAMPOS_AUDITADOS.filter((c) => a[c] !== d[c]);
      if (mudou.length > 0) {
        await this.log.registrar(
          {
            usuarioId: autor.usuarioId,
            acao: 'edicao_usuario',
            entidadeAfetada: 'usuario',
            entidadeId: id,
            detalhes: { antes: Object.fromEntries(mudou.map((c) => [c, a[c]])), depois: Object.fromEntries(mudou.map((c) => [c, d[c]])) },
            enderecoIp: autor.enderecoIp,
          },
          m,
        );
      }
      return depois;
    });
  }

  async gerarSenha(id: string, autor: Autor): Promise<string> {
    if (!/^\d+$/.test(id)) throw new NotFoundException('Usuário não encontrado.');
    const senhaProvisoria = gerarSenhaProvisoria();
    const hash = await gerarHashSenha(senhaProvisoria);
    await this.fonte.transaction(async (m) => {
      await this.buscar(id, m);
      await m.query(`UPDATE usuario SET senha_hash = $2 WHERE id = $1`, [id, hash]);
      await this.log.registrar(
        { usuarioId: autor.usuarioId, acao: 'senha_provisoria_usuario', entidadeAfetada: 'usuario', entidadeId: id, enderecoIp: autor.enderecoIp },
        m,
      );
    });
    return senhaProvisoria;
  }

  async buscar(id: string, m: EntityManager = this.fonte.manager): Promise<UsuarioDto> {
    const [usuario] = await m.query(`${CONSULTA} WHERE u.id = $1`, [id]);
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');
    return usuario;
  }

  private async validarReferencias(m: EntityManager, orgaoId?: string, perfilId?: string) {
    if (orgaoId && (await m.query(`SELECT 1 FROM orgao WHERE id = $1`, [orgaoId])).length === 0) {
      throw new BadRequestException('Órgão não encontrado.');
    }
    if (perfilId && (await m.query(`SELECT 1 FROM perfil WHERE id = $1`, [perfilId])).length === 0) {
      throw new BadRequestException('Perfil não encontrado.');
    }
  }

  private async validarEmailLivre(m: EntityManager, email: string) {
    if ((await m.query(`SELECT 1 FROM usuario WHERE lower(email) = lower($1)`, [email])).length > 0) {
      throw new ConflictException(`O e-mail ${email} já está cadastrado.`);
    }
  }
}

function auditavel(u: UsuarioDto) {
  return { nome: u.nome, email: u.email, orgao: u.orgao, perfil: u.perfil, ativo: u.ativo };
}

import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAtividadeService } from '../log-atividade/log-atividade.service';
import { Usuario } from '../usuarios/usuario.entity';
import { SessaoDto, UsuarioSessaoDto } from './dto/sessao.dto';
import { Permissao } from './permissao.decorator';
import { gerarHashSenha, verificarSenha } from './senha';

export const DURACAO_TOKEN_SEGUNDOS = 8 * 60 * 60;
export const MENSAGEM_CREDENCIAL_INVALIDA = 'E-mail ou senha inválidos.';

@Injectable()
export class AuthService implements OnModuleInit {
  private hashFicticio: string;

  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly jwt: JwtService,
    private readonly log: LogAtividadeService,
  ) {}

  async onModuleInit() {
    this.hashFicticio = await gerarHashSenha('senha-ficticia-para-tempo-constante');
  }

  async autenticar(email: string, senha: string, enderecoIp: string | null): Promise<SessaoDto> {
    const emailNormalizado = email.trim().toLowerCase();
    const usuario = await this.usuarios
      .createQueryBuilder('u')
      .addSelect('u.senhaHash')
      .innerJoinAndSelect('u.perfil', 'perfil')
      .innerJoinAndSelect('u.orgao', 'orgao')
      .where('lower(u.email) = :email', { email: emailNormalizado })
      .getOne();

    // sem usuário, verifica contra hash fictício para o tempo de resposta não revelar se o e-mail existe
    const senhaConfere = await verificarSenha(usuario?.senhaHash ?? this.hashFicticio, senha);
    const motivo = !usuario ? 'usuario_inexistente' : !senhaConfere ? 'senha_incorreta' : !usuario.ativo ? 'usuario_inativo' : null;

    if (motivo || !usuario) {
      await this.log.registrar({
        usuarioId: usuario?.id ?? null,
        acao: 'autenticacao',
        entidadeAfetada: 'usuario',
        entidadeId: usuario?.id,
        detalhes: { resultado: 'falha', motivo, email: emailNormalizado },
        enderecoIp,
      });
      throw new UnauthorizedException(MENSAGEM_CREDENCIAL_INVALIDA);
    }

    const agora = new Date();
    await this.usuarios.update(usuario.id, { ultimoAcesso: agora });
    await this.log.registrar({
      usuarioId: usuario.id,
      acao: 'autenticacao',
      entidadeAfetada: 'usuario',
      entidadeId: usuario.id,
      detalhes: { resultado: 'sucesso' },
      enderecoIp,
    });

    usuario.permissoes = await this.permissoes(usuario.perfil.id);
    const token = await this.jwt.signAsync({ sub: usuario.id }, { expiresIn: DURACAO_TOKEN_SEGUNDOS });
    return {
      token,
      expiraEm: new Date(agora.getTime() + DURACAO_TOKEN_SEGUNDOS * 1000).toISOString(),
      usuario: UsuarioSessaoDto.de(usuario),
    };
  }

  async usuarioDoToken(token: string): Promise<Usuario | null> {
    try {
      const { sub } = await this.jwt.verifyAsync<{ sub: string }>(token);
      const usuario = await this.usuarios.findOne({ where: { id: sub } });
      if (!usuario?.ativo) return null;
      usuario.permissoes = await this.permissoes(usuario.perfil.id);
      return usuario;
    } catch {
      return null;
    }
  }

  async permissoes(perfilId: string): Promise<Permissao[]> {
    const linhas: { codigo: Permissao }[] = await this.usuarios.query(
      `SELECT p.codigo FROM perfil_permissao pp JOIN permissao p ON p.id = pp.permissao_id WHERE pp.perfil_id = $1`,
      [perfilId],
    );
    return linhas.map((l) => l.codigo);
  }
}

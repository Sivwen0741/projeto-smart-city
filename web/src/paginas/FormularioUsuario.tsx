import { FormEvent, useState } from 'react';
import { Aviso } from '../componentes/Aviso';
import { Botao } from '../componentes/Botao';
import { CaixaSelecao } from '../componentes/CaixaSelecao';
import { Campo } from '../componentes/Campo';
import { Segmentado } from '../componentes/Segmentado';
import { Selecao } from '../componentes/Selecao';
import type { Orgao } from '../ocorrencias/modelo';
import { ErroApi } from '../sessao/api';
import { useSessao } from '../sessao/sessao';
import { DOMINIO_FUNCIONAL, Perfil, ROTULOS_PERFIL, Usuario, usuariosApi } from '../usuarios/modelo';
import estilos from './FormularioRegra.module.css';
import proprios from './FormularioUsuario.module.css';

interface Formulario {
  nome: string;
  email: string;
  orgaoId: string;
  perfilId: string | null;
  ativo: boolean;
}

type NomeCampo = 'nome' | 'email' | 'orgaoId' | 'perfilId';

const ROTULOS: Record<NomeCampo, string> = { nome: 'nome', email: 'e-mail', orgaoId: 'órgão', perfilId: 'perfil' };

const PERMISSOES: Record<string, string> = {
  consultar: 'consulta todas as telas',
  operar: 'atende alertas e ocorrências',
  configurar: 'configura dispositivos e regras',
  administrar: 'administra usuários',
};

interface Props {
  usuario: Usuario | null;
  senhaProvisoria?: string;
  perfis: Perfil[];
  orgaos: Orgao[];
  aoSalvar: (usuario: Usuario, senha?: string) => void;
  aoFechar: () => void;
}

function validar(f: Formulario): Partial<Record<NomeCampo, string>> {
  const erros: Partial<Record<NomeCampo, string>> = {};
  const email = f.email.trim().toLowerCase();
  if (!f.nome.trim()) erros.nome = 'Informe o nome.';
  if (!email) erros.email = 'Informe o e-mail funcional.';
  else if (!email.endsWith(`@${DOMINIO_FUNCIONAL}`)) erros.email = `Use o e-mail funcional (@${DOMINIO_FUNCIONAL}).`;
  if (!f.orgaoId) erros.orgaoId = 'Escolha o órgão.';
  if (!f.perfilId) erros.perfilId = 'Escolha o perfil.';
  return erros;
}

export function FormularioUsuario({ usuario, senhaProvisoria, perfis, orgaos, aoSalvar, aoFechar }: Props) {
  const { usuario: eu } = useSessao();
  const [f, setF] = useState<Formulario>(() =>
    usuario
      ? { nome: usuario.nome, email: usuario.email, orgaoId: usuario.orgaoId, perfilId: usuario.perfilId, ativo: usuario.ativo }
      : { nome: '', email: '', orgaoId: '', perfilId: null, ativo: true },
  );
  const [tocados, setTocados] = useState<Partial<Record<NomeCampo, boolean>>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<'salvar' | 'senha' | null>(null);

  const editando = usuario !== null;
  const proprio = editando && usuario.id === eu?.id;
  const erros = validar(f);
  const valido = Object.keys(erros).length === 0;
  const erro = (campo: NomeCampo) => (tocados[campo] ? erros[campo] : undefined);
  const perfilEscolhido = perfis.find((p) => p.id === f.perfilId);

  function alterar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setF((atual) => ({ ...atual, [campo]: valor }));
    setTocados((atual) => ({ ...atual, [campo]: true }));
  }

  async function executar(acao: 'salvar' | 'senha', tarefa: () => Promise<void>) {
    setEnviando(acao);
    setErroGeral(null);
    try {
      await tarefa();
    } catch (e) {
      setErroGeral(e instanceof ErroApi ? e.message : 'Não foi possível falar com o servidor. Tente de novo.');
    } finally {
      setEnviando(null);
    }
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!valido) {
      setTocados({ nome: true, email: true, orgaoId: true, perfilId: true });
      return;
    }
    const dados = { nome: f.nome.trim(), email: f.email.trim().toLowerCase(), orgaoId: f.orgaoId, perfilId: f.perfilId! };
    executar('salvar', async () => {
      if (editando) aoSalvar(await usuariosApi.atualizar(usuario.id, { ...dados, ...(!proprio && { ativo: f.ativo }) }));
      else {
        const criado = await usuariosApi.criar(dados);
        aoSalvar(criado.usuario, criado.senhaProvisoria);
      }
    });
  }

  function gerarSenha() {
    if (!usuario) return;
    executar('senha', async () => aoSalvar(usuario, (await usuariosApi.gerarSenha(usuario.id)).senhaProvisoria));
  }

  return (
    <aside className={estilos.painel} aria-label={editando ? 'Editar usuário' : 'Novo usuário'}>
      <header className={estilos.cabecalho}>
        <h2>{editando ? 'Editar usuário' : 'Novo usuário'}</h2>
        <Botao variante="link" onClick={aoFechar}>
          Fechar
        </Botao>
      </header>

      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <div className={estilos.corpo}>
          {senhaProvisoria && (
            <div className={proprios.senha} role="status">
              <span className={proprios.rotulo}>Senha provisória</span>
              <strong className="numero">{senhaProvisoria}</strong>
              <span className={estilos.dica}>Entregue ao usuário. Ela não aparece de novo; se perder, gere outra.</span>
            </div>
          )}

          <Campo rotulo="Nome" maxLength={120} erro={erro('nome')} value={f.nome} onChange={(e) => alterar('nome', e.target.value)} />
          <Campo
            rotulo="E-mail funcional"
            type="email"
            maxLength={160}
            placeholder={`nome.sobrenome@${DOMINIO_FUNCIONAL}`}
            erro={erro('email')}
            value={f.email}
            onChange={(e) => alterar('email', e.target.value)}
          />
          <Selecao
            rotulo="Órgão"
            vazio="Escolha o órgão"
            erro={erro('orgaoId')}
            opcoes={orgaos.map((o) => ({ valor: o.id, rotulo: o.nome }))}
            value={f.orgaoId}
            onChange={(e) => alterar('orgaoId', e.target.value)}
          />
          <Segmentado
            rotulo="Perfil"
            opcoes={perfis.map((p) => ({ valor: p.id, rotulo: ROTULOS_PERFIL[p.nome] ?? p.nome, descricao: p.descricao ?? undefined }))}
            valor={f.perfilId}
            erro={erro('perfilId') ?? (proprio && f.perfilId !== usuario.perfilId ? 'Você não pode mudar o próprio perfil.' : undefined)}
            aoMudar={(perfilId) => alterar('perfilId', perfilId)}
          />
          {perfilEscolhido && <span className={estilos.dica}>{perfilEscolhido.permissoes.map((p) => PERMISSOES[p]).join(' · ')}</span>}

          {editando && (
            <div className={estilos.ativa}>
              <CaixaSelecao
                rotulo="Usuário ativo"
                checked={f.ativo}
                disabled={proprio}
                title={proprio ? 'Você não pode inativar o próprio usuário' : undefined}
                onChange={(e) => alterar('ativo', e.target.checked)}
              />
              <span className={estilos.dica}>· inativo não entra, mas continua no histórico</span>
            </div>
          )}

          {editando && (
            <div className={proprios.acao}>
              <Botao onClick={gerarSenha} disabled={enviando !== null}>
                {enviando === 'senha' ? 'Gerando…' : 'Gerar nova senha provisória'}
              </Botao>
              <span className={estilos.dica}>A senha atual deixa de valer.</span>
            </div>
          )}

          <p className={estilos.nota}>Cada alteração fica no log de atividades, com o autor e o que mudou.</p>

          {erroGeral && <Aviso>{erroGeral}</Aviso>}
        </div>

        {!valido && (
          <p className={estilos.pendente} aria-live="polite">
            Para salvar, corrija: {(Object.keys(erros) as NomeCampo[]).map((c) => ROTULOS[c]).join(', ')}.
          </p>
        )}

        <footer className={estilos.rodape}>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" variante="primario" disabled={!valido || enviando !== null || (proprio && f.perfilId !== usuario.perfilId)}>
            {enviando === 'salvar' ? 'Salvando…' : editando ? 'Salvar alterações' : 'Cadastrar usuário'}
          </Botao>
        </footer>
      </form>
    </aside>
  );
}

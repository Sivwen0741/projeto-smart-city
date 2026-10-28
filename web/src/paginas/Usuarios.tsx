import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Aviso } from '../componentes/Aviso';
import { Botao } from '../componentes/Botao';
import { Orgao, ocorrenciasApi } from '../ocorrencias/modelo';
import { ErroApi } from '../sessao/api';
import { useSessao } from '../sessao/sessao';
import { Perfil, ROTULOS_PERFIL, Usuario, usuariosApi } from '../usuarios/modelo';
import estilos from './Dispositivos.module.css';
import { FormularioUsuario } from './FormularioUsuario';
import proprios from './Regras.module.css';

type Painel = { modo: 'fechado' } | { modo: 'novo' } | { modo: 'edicao'; usuario: Usuario; senha?: string };

const acesso = (quando: string | null) =>
  quando ? new Date(quando).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'nunca entrou';

export function Usuarios() {
  const { pode } = useSessao();
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [orgaos, setOrgaos] = useState<Orgao[]>([]);
  const [painel, setPainel] = useState<Painel>({ modo: 'fechado' });
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setUsuarios(await usuariosApi.listar());
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível carregar os usuários.');
    }
  }, []);

  useEffect(() => {
    if (!pode('administrar')) return;
    carregar();
    Promise.all([usuariosApi.perfis(), ocorrenciasApi.orgaos()])
      .then(([p, o]) => {
        setPerfis(p);
        setOrgaos(o);
      })
      .catch(() => setErro('Não foi possível carregar os perfis e órgãos.'));
  }, [carregar, pode]);

  if (!pode('administrar')) return <Navigate to="/painel" replace />;

  async function salvo(usuario: Usuario, senha?: string) {
    setPainel({ modo: 'edicao', usuario, senha });
    await carregar();
  }

  const ativos = usuarios?.filter((u) => u.ativo).length ?? 0;
  const selecionado = painel.modo === 'edicao' ? painel.usuario.id : null;

  return (
    <div className={estilos.pagina}>
      <section className={estilos.principal}>
        <div className={estilos.titulo}>
          <h1>Usuários</h1>
          {usuarios && (
            <span className={estilos.resumo}>
              {usuarios.length} {usuarios.length === 1 ? 'cadastrado' : 'cadastrados'}, {ativos} {ativos === 1 ? 'ativo' : 'ativos'} · inativar
              não exclui
            </span>
          )}
        </div>

        <div className={estilos.ferramentas}>
          <Botao variante="primario" className={proprios.cadastrar} onClick={() => setPainel({ modo: 'novo' })}>
            Cadastrar usuário
          </Botao>
        </div>

        {erro && <Aviso>{erro}</Aviso>}

        <div className={estilos.tabela}>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail funcional</th>
                <th>Órgão</th>
                <th>Perfil</th>
                <th>Situação</th>
                <th>Último acesso</th>
              </tr>
            </thead>
            <tbody>
              {usuarios?.map((u) => (
                <tr
                  key={u.id}
                  className={[u.id === selecionado && estilos.selecionada, !u.ativo && estilos.inativa].filter(Boolean).join(' ')}
                  onClick={() => setPainel({ modo: 'edicao', usuario: u })}
                >
                  <td className={proprios.nome}>
                    <button type="button" className={estilos.abrir} onClick={() => setPainel({ modo: 'edicao', usuario: u })}>
                      {u.nome}
                    </button>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.orgao}</td>
                  <td>{ROTULOS_PERFIL[u.perfil] ?? u.perfil}</td>
                  <td>
                    <span className={`${estilos.situacao} ${u.ativo ? estilos.operando : estilos.inativo}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span>
                  </td>
                  <td className="numero">{acesso(u.ultimoAcesso)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {painel.modo !== 'fechado' && (
        <FormularioUsuario
          key={painel.modo === 'edicao' ? `${painel.usuario.id}-${JSON.stringify(painel.usuario)}-${painel.senha ?? ''}` : 'novo'}
          usuario={painel.modo === 'edicao' ? painel.usuario : null}
          senhaProvisoria={painel.modo === 'edicao' ? painel.senha : undefined}
          perfis={perfis}
          orgaos={orgaos}
          aoSalvar={salvo}
          aoFechar={() => setPainel({ modo: 'fechado' })}
        />
      )}
    </div>
  );
}

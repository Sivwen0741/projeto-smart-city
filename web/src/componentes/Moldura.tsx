import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { alertasApi, ResumoAlertas } from '../alertas/modelo';
import { FaixaGrave } from './FaixaGrave';
import { ocorrenciasApi } from '../ocorrencias/modelo';
import { useRegistroOcorrencia } from '../ocorrencias/registro';
import { FormularioOcorrencia } from '../paginas/FormularioOcorrencia';
import { Permissao, useSessao } from '../sessao/sessao';
import { useAlertasAoVivo } from '../tempo-real/tempoReal';
import { Botao } from './Botao';
import { BuscaCabecalho } from './BuscaCabecalho';
import { Marca } from './Marca';
import estilos from './Moldura.module.css';
import { Previsao, Previsto, textoPrevisao } from './Previsto';

interface Aba {
  rotulo: string;
  caminho?: string;
  previsao?: Previsao;
  permissao?: Permissao;
}

export const SEM_PERMISSAO = 'Seu perfil não permite esta ação.';

// previsões conforme a seção 2.5 do replanejamento da sprint 4
export const ABAS: Aba[] = [
  { rotulo: 'Painel', caminho: '/painel' },
  { rotulo: 'Alertas', caminho: '/alertas' },
  { rotulo: 'Ocorrências', caminho: '/ocorrencias' },
  { rotulo: 'Mapa', caminho: '/mapa' },
  { rotulo: 'Dispositivos', caminho: '/dispositivos' },
  { rotulo: 'Regras', caminho: '/regras' },
  { rotulo: 'Relatórios', previsao: { historia: 'US16', sprint: 'backlog' } },
  { rotulo: 'Usuários', caminho: '/usuarios', permissao: 'administrar' },
];

function useResumoAlertas() {
  const [resumo, setResumo] = useState<ResumoAlertas | null>(null);
  const carregar = useCallback(
    () =>
      alertasApi
        .resumo()
        .then(setResumo)
        .catch(() => undefined),
    [],
  );
  useAlertasAoVivo(carregar);
  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 15_000);
    return () => clearInterval(intervalo);
  }, [carregar]);
  return resumo;
}

function useOcorrenciasAbertas() {
  const [abertas, setAbertas] = useState<number | null>(null);
  const carregar = useCallback(
    () =>
      ocorrenciasApi
        .listar('andamento')
        .then((lista) => setAbertas(lista.filter((o) => o.situacao === 'aberta').length))
        .catch(() => undefined),
    [],
  );
  useAlertasAoVivo(carregar);
  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 15_000);
    return () => clearInterval(intervalo);
  }, [carregar]);
  return abertas;
}

function useAgora() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 15_000);
    return () => clearInterval(intervalo);
  }, []);
  return agora;
}

export function Moldura() {
  const { usuario, sair, pode } = useSessao();
  const agora = useAgora();
  const resumo = useResumoAlertas();
  const ocorrenciasAbertas = useOcorrenciasAbertas();
  const registro = useRegistroOcorrencia();
  const alertasAtivos = resumo?.ativos ?? null;
  const data = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
    .format(agora)
    .replace(/[.,]/g, '')
    .replace(' de ', ' ');
  const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(agora);

  return (
    <div className={estilos.moldura}>
      <header className={estilos.topo}>
        <div className={estilos.titulo}>
          <Marca />
          Centro Integrado de Operações Urbanas
        </div>
        <span className={`${estilos.item} ${estilos.prefeitura}`}>Prefeitura Municipal de Ponta Grossa</span>
        <div className={estilos.direita}>
          <span className={estilos.item}>
            {usuario?.nome}, {usuario?.perfil}
          </span>
          <span className={estilos.item}>
            {data}
            <span className={`${estilos.hora} numero`}>{hora}</span>
          </span>
          <span className={estilos.item}>
            <button type="button" className={estilos.sair} onClick={sair}>
              Sair
            </button>
          </span>
        </div>
      </header>

      <nav className={estilos.navegacao} aria-label="Navegação principal">
        <ul className={estilos.abas}>
          {ABAS.map((aba) => (
            <li key={aba.rotulo}>
              {aba.caminho && aba.permissao && !pode(aba.permissao) ? (
                <span className={`${estilos.aba} ${estilos.prevista}`} aria-disabled="true" title="Só para o perfil administrador">
                  {aba.rotulo}
                </span>
              ) : aba.caminho ? (
                <NavLink
                  to={aba.caminho}
                  className={({ isActive }) => [estilos.aba, isActive && estilos.ativa].filter(Boolean).join(' ')}
                >
                  {aba.rotulo}
                  {aba.caminho === '/alertas' && alertasAtivos !== null && <span className={estilos.contador}>{alertasAtivos}</span>}
                  {aba.caminho === '/ocorrencias' && ocorrenciasAbertas !== null && <span className={estilos.contador}>{ocorrenciasAbertas}</span>}
                </NavLink>
              ) : (
                <span
                  className={`${estilos.aba} ${estilos.prevista}`}
                  aria-disabled="true"
                  title={`Previsto: ${textoPrevisao(aba.previsao!)}`}
                >
                  {aba.rotulo}
                  <Previsto previsao={aba.previsao!} />
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className={estilos.acoes}>
          <BuscaCabecalho />
          <Botao
            variante="primario"
            disabled={!pode('operar')}
            title={pode('operar') ? undefined : SEM_PERMISSAO}
            onClick={() => registro.abrir()}
          >
            Registrar ocorrência
          </Botao>
        </div>
      </nav>

      {resumo && resumo.gravesSemReconhecimento > 0 && resumo.graveMaisAntigo && (
        <FaixaGrave quantidade={resumo.gravesSemReconhecimento} maisAntigo={resumo.graveMaisAntigo} />
      )}

      <main className={estilos.conteudo}>
        <Outlet />
        {registro.aberto && (
          <div className={estilos.sobreposto}>
            <FormularioOcorrencia key={registro.alerta?.id ?? 'telefone'} />
          </div>
        )}
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useSessao } from '../sessao/sessao';
import { Botao } from './Botao';
import { Marca } from './Marca';
import estilos from './Moldura.module.css';
import { Previsao, Previsto, textoPrevisao } from './Previsto';

interface Aba {
  rotulo: string;
  caminho?: string;
  previsao?: Previsao;
}

// previsões conforme a seção 2.5 do replanejamento da sprint 4
export const ABAS: Aba[] = [
  { rotulo: 'Painel', previsao: { historia: 'US12', sprint: 'sprint 6' } },
  { rotulo: 'Alertas', previsao: { historia: 'US02', sprint: 'sprint 5' } },
  { rotulo: 'Ocorrências', previsao: { historia: 'US05', sprint: 'sprint 5' } },
  { rotulo: 'Mapa', previsao: { historia: 'US01', sprint: 'sprint 5' } },
  { rotulo: 'Dispositivos', caminho: '/dispositivos' },
  { rotulo: 'Regras', caminho: '/regras' },
  { rotulo: 'Relatórios', previsao: { historia: 'US16', sprint: 'backlog' } },
  { rotulo: 'Usuários', previsao: { historia: 'US21', sprint: 'sprint 6' } },
];

const BUSCA: Previsao = { historia: 'US26', sprint: 'sprint 6' };
const REGISTRAR_OCORRENCIA: Previsao = { historia: 'US05', sprint: 'sprint 5' };

function useAgora() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 15_000);
    return () => clearInterval(intervalo);
  }, []);
  return agora;
}

export function Moldura() {
  const { usuario, sair } = useSessao();
  const agora = useAgora();
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
              {aba.caminho ? (
                <NavLink
                  to={aba.caminho}
                  className={({ isActive }) => [estilos.aba, isActive && estilos.ativa].filter(Boolean).join(' ')}
                >
                  {aba.rotulo}
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
          <span className={estilos.busca} aria-disabled="true" title={`Previsto: ${textoPrevisao(BUSCA)}`}>
            Buscar ocorrência
            <Previsto previsao={BUSCA} />
          </span>
          <Botao variante="primario" disabled title={`Previsto: ${textoPrevisao(REGISTRAR_OCORRENCIA)}`}>
            Registrar ocorrência&nbsp;
            <Previsto previsao={REGISTRAR_OCORRENCIA} />
          </Botao>
        </div>
      </nav>

      <main className={estilos.conteudo}>
        <Outlet />
      </main>
    </div>
  );
}

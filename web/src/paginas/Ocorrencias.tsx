import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRAVIDADES } from '../alertas/modelo';
import { Aviso } from '../componentes/Aviso';
import { Previsao, Previsto, textoPrevisao } from '../componentes/Previsto';
import { Ocorrencia, ocorrenciasApi, SITUACOES_OCORRENCIA, tempoEmAberto, VisaoOcorrencia } from '../ocorrencias/modelo';
import { useAlertasAoVivo } from '../tempo-real/tempoReal';
import estilos from './Ocorrencias.module.css';

const BUSCA: Previsao = { historia: 'US26', sprint: 'sprint 6' };
const FILTROS: Previsao = { historia: 'US08', sprint: 'backlog' };
const EXPORTAR: Previsao = { historia: 'US25', sprint: 'backlog' };
const ATUALIZACAO_MS = 15_000;

const CLASSE_SITUACAO: Record<string, string> = { aberta: estilos.aberta, em_atendimento: estilos.emAtendimento, encerrada: estilos.encerrada };

const dataHora = (instante: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(instante)).replace(',', ' às');

function resumoAndamento(lista: Ocorrencia[], agora: number): string {
  const abertas = lista.filter((o) => o.situacao === 'aberta');
  const emAtendimento = lista.length - abertas.length;
  const partes = [`${abertas.length} ${abertas.length === 1 ? 'aberta' : 'abertas'}`, `${emAtendimento} em atendimento`];
  const maisAntiga = abertas.reduce<Ocorrencia | null>((a, o) => (!a || o.dataAbertura < a.dataAbertura ? o : a), null);
  if (maisAntiga) partes.push(`a mais antiga aberta há ${tempoEmAberto(maisAntiga.dataAbertura, agora)}`);
  return partes.join(', ');
}

export function Ocorrencias() {
  const navegar = useNavigate();
  const [visao, setVisao] = useState<VisaoOcorrencia>('andamento');
  const [listas, setListas] = useState<Record<VisaoOcorrencia, Ocorrencia[]> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [agora, setAgora] = useState(() => Date.now());

  const carregar = useCallback(async () => {
    try {
      const [andamento, encerradas] = await Promise.all([ocorrenciasApi.listar('andamento'), ocorrenciasApi.listar('encerradas')]);
      setListas({ andamento, encerradas });
      setAgora(Date.now());
      setErro(null);
    } catch {
      setErro('Não foi possível carregar as ocorrências.');
    }
  }, []);

  useAlertasAoVivo(carregar);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, [carregar]);

  const lista = listas?.[visao] ?? null;

  return (
    <div className={estilos.pagina}>
      <section className={estilos.principal}>
        <div className={estilos.titulo}>
          <h1>Ocorrências</h1>
          {listas && <span className={estilos.resumo}>{resumoAndamento(listas.andamento, agora)}</span>}
        </div>

        <nav className={estilos.visoes} aria-label="Visões das ocorrências">
          {(
            [
              ['andamento', 'Em andamento', listas ? String(listas.andamento.length) : ''],
              ['encerradas', 'Encerradas', listas ? `${listas.encerradas.length} nos últimos 30 dias` : ''],
            ] as const
          ).map(([v, rotulo, contagem]) => (
            <button
              key={v}
              type="button"
              className={[estilos.visao, v === visao && estilos.atual].filter(Boolean).join(' ')}
              aria-pressed={v === visao}
              onClick={() => setVisao(v)}
            >
              {rotulo}
              <span className={estilos.contagem}>{contagem}</span>
            </button>
          ))}
        </nav>

        <div className={estilos.ferramentas}>
          <span className={estilos.busca} aria-disabled="true" title={`Previsto: ${textoPrevisao(BUSCA)}`}>
            Buscar ocorrência <Previsto previsao={BUSCA} />
          </span>
          {['Gravidade', 'Órgão', 'Bairro'].map((filtro) => (
            <span key={filtro} className={estilos.filtro} aria-disabled="true" title={`Previsto: ${textoPrevisao(FILTROS)}`}>
              {filtro}
            </span>
          ))}
          <Previsto previsao={FILTROS} />
          <span className={`${estilos.filtro} ${estilos.exportar}`} aria-disabled="true" title={`Previsto: ${textoPrevisao(EXPORTAR)}`}>
            Exportar <Previsto previsao={EXPORTAR} />
          </span>
        </div>

        {erro && <Aviso>{erro}</Aviso>}

        <div className={estilos.tabela}>
          <table>
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Gravidade</th>
                <th>Ocorrência</th>
                <th>Localização</th>
                <th>Órgão</th>
                <th>Situação</th>
                <th>{visao === 'andamento' ? 'Em aberto' : 'Encerrada em'}</th>
              </tr>
            </thead>
            <tbody>
              {lista?.map((o) => (
                <tr key={o.id} onClick={() => navegar(`/ocorrencias/${o.id}`)}>
                  <td className={estilos.protocolo}>
                    <button type="button" className={estilos.abrir} onClick={() => navegar(`/ocorrencias/${o.id}`)}>
                      {o.protocolo}
                    </button>
                  </td>
                  <td>
                    <span className={`${estilos.gravidade} ${estilos[o.criticidade]}`}>{GRAVIDADES[o.criticidade]}</span>
                  </td>
                  <td className={estilos.ocorrencia}>
                    <div className={estilos.nome}>{o.categoria}</div>
                    {o.descricao && <div className={estilos.apoio}>{o.descricao}</div>}
                  </td>
                  <td>
                    <div>{o.bairro ?? 'Zona rural'}</div>
                    {o.endereco && <div className={estilos.apoio}>{o.endereco}</div>}
                  </td>
                  <td>{o.orgao ?? '–'}</td>
                  <td>
                    <span className={`${estilos.etiqueta} ${CLASSE_SITUACAO[o.situacao] ?? ''}`}>{SITUACOES_OCORRENCIA[o.situacao] ?? o.situacao}</span>
                  </td>
                  <td className={`${estilos.tempo} numero`} title={`Aberta em ${dataHora(o.dataAbertura)}`}>
                    {visao === 'andamento' ? tempoEmAberto(o.dataAbertura, agora) : o.dataEncerramento && dataHora(o.dataEncerramento)}
                  </td>
                </tr>
              ))}
              {lista?.length === 0 && (
                <tr>
                  <td colSpan={7} className={estilos.semDados}>
                    {visao === 'andamento' ? 'Nenhuma ocorrência em andamento.' : 'Nenhuma ocorrência encerrada nos últimos 30 dias.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

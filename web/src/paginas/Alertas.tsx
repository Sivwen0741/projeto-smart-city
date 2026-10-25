import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alerta, alertasApi, fixoAteReconhecer, GRAVIDADES, limite, lugar, medida, ResumoAlertas, SITUACOES_ALERTA, Visao } from '../alertas/modelo';
import { Aviso } from '../componentes/Aviso';
import { Botao } from '../componentes/Botao';
import { Previsao, Previsto, textoPrevisao } from '../componentes/Previsto';
import { useAlertasAoVivo } from '../tempo-real/tempoReal';
import estilos from './Alertas.module.css';

const BUSCA: Previsao = { historia: 'US26', sprint: 'sprint 6' };
const FILTROS: Previsao = { historia: 'US08', sprint: 'backlog' };
const EXPORTAR: Previsao = { historia: 'US25', sprint: 'backlog' };
export const RECONHECER: Previsao = { historia: 'US04', sprint: 'sprint 5' };
export const ABRIR_OCORRENCIA: Previsao = { historia: 'US06', sprint: 'sprint 6' };
const ATUALIZACAO_MS = 15_000;
// meta citada em design/03-alertas.svg
const META_RECONHECIMENTO_MIN = 15;

const PLURAIS: Record<string, string> = {
  'Sensor de nível': 'sensores de nível',
  'Sensor de tráfego': 'sensores de tráfego',
  'Sensor de ruído': 'sensores de ruído',
  Câmera: 'câmeras',
  'Semáforo inteligente': 'semáforos inteligentes',
  'Estação ambiental': 'estações ambientais',
  'Controlador de iluminação': 'controladores de iluminação',
};

function porTipo(lista: { tipo: string; quantidade: number }[]): string {
  if (lista.length === 0) return 'todos comunicando';
  const partes = lista.map((p) => `${p.quantidade} ${p.quantidade === 1 ? p.tipo.toLowerCase() : (PLURAIS[p.tipo] ?? p.tipo.toLowerCase())}`);
  return partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`;
}

const hora = (instante: string) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(instante));

const VISOES: { visao: Visao; rotulo: string; contagem: (r: ResumoAlertas) => number }[] = [
  { visao: 'ativos', rotulo: 'Ativos', contagem: (r) => r.ativos },
  { visao: 'em_atendimento', rotulo: 'Em atendimento', contagem: (r) => r.emAtendimento },
  { visao: 'encerrados_hoje', rotulo: 'Encerrados hoje', contagem: (r) => r.encerradosHoje },
];

export function Alertas() {
  const [visao, setVisao] = useState<Visao>('ativos');
  const [alertas, setAlertas] = useState<Alerta[] | null>(null);
  const [resumo, setResumo] = useState<ResumoAlertas | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [lista, r] = await Promise.all([alertasApi.listar(visao), alertasApi.resumo()]);
      setAlertas(lista);
      setResumo(r);
      setErro(null);
    } catch {
      setErro('Não foi possível carregar os alertas.');
    }
  }, [visao]);

  useAlertasAoVivo(carregar);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, [carregar]);

  return (
    <div className={estilos.pagina}>
      <nav className={estilos.visoes} aria-label="Visões dos alertas">
        {VISOES.map((v) => (
          <button
            key={v.visao}
            type="button"
            className={[estilos.visao, v.visao === visao && estilos.atual].filter(Boolean).join(' ')}
            aria-pressed={v.visao === visao}
            onClick={() => setVisao(v.visao)}
          >
            {v.rotulo}
            {resumo && (
              <span className={`${estilos.contagem} ${v.visao === 'ativos' && resumo.gravesSemReconhecimento > 0 ? estilos.grave : ''}`}>
                {v.contagem(resumo)}
              </span>
            )}
          </button>
        ))}
        <Link className={estilos.visao} to="/regras">
          Regras de alerta
        </Link>
      </nav>

      {resumo && (
        <dl className={estilos.resumo}>
          <div>
            <dt className="numero">{resumo.ativos}</dt>
            <dd>alertas ativos agora</dd>
            <dd className={estilos.apoio}>
              {resumo.gravesSemReconhecimento} {resumo.gravesSemReconhecimento === 1 ? 'grave sem reconhecimento' : 'graves sem reconhecimento'}
            </dd>
          </div>
          <div>
            <dt className="numero">
              {resumo.tempoMedioReconhecimentoMinutos === null ? '–' : `${Math.round(resumo.tempoMedioReconhecimentoMinutos)} min`}
            </dt>
            <dd>tempo médio até o reconhecimento</dd>
            <dd className={estilos.apoio}>meta do plantão: {META_RECONHECIMENTO_MIN} min</dd>
          </div>
          <div>
            <dt className="numero">{resumo.ultimas24h}</dt>
            <dd>alertas nas últimas 24 h</dd>
            <dd className={estilos.apoio}>{resumo.encerradosUltimas24h} {resumo.encerradosUltimas24h === 1 ? 'já encerrado' : 'já encerrados'}</dd>
          </div>
          <div>
            <dt className="numero">{resumo.semComunicacao}</dt>
            <dd>dispositivos sem comunicação</dd>
            <dd className={estilos.apoio}>{porTipo(resumo.semComunicacaoPorTipo)}</dd>
          </div>
        </dl>
      )}

      <div className={estilos.ferramentas}>
        <span className={estilos.busca} aria-disabled="true" title={`Previsto: ${textoPrevisao(BUSCA)}`}>
          Buscar alerta <Previsto previsao={BUSCA} />
        </span>
        {['Gravidade', 'Todos os bairros', 'Últimas 24 h'].map((f) => (
          <span key={f} className={estilos.filtro} aria-disabled="true" title={`Previsto: ${textoPrevisao(FILTROS)}`}>
            {f}
          </span>
        ))}
        <Previsto previsao={FILTROS} />
        <span className={`${estilos.filtro} ${estilos.exportar}`} aria-disabled="true" title={`Previsto: ${textoPrevisao(EXPORTAR)}`}>
          Exportar <Previsto previsao={EXPORTAR} />
        </span>
        <Link className={estilos.novaRegra} to="/regras">
          Nova regra
        </Link>
      </div>

      {erro && <Aviso>{erro}</Aviso>}

      <div className={estilos.tabela}>
        <table>
          <thead>
            <tr>
              <th>Gravidade</th>
              <th>Alerta</th>
              <th>Dispositivo</th>
              <th>Medição</th>
              <th>Detecção</th>
              <th>Órgão</th>
              <th>Situação</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {alertas?.map((a) => (
              <tr key={a.id}>
                <td>
                  <span className={`${estilos.gravidade} ${estilos[a.criticidade]}`}>{GRAVIDADES[a.criticidade]}</span>
                </td>
                <td>
                  <div className={estilos.nome}>{a.regra}</div>
                  <div className={estilos.apoio}>{lugar(a)}</div>
                </td>
                <td>{a.dispositivo}</td>
                <td className="numero">
                  <strong>{medida(a.valorObservado, a.unidade)}</strong>{' '}
                  <span className={estilos.apoio}>limite {limite(a)}</span>
                </td>
                <td title={new Date(a.dataHora).toLocaleString('pt-BR')}>{hora(a.dataHora)}</td>
                <td>{a.orgao ?? '–'}</td>
                <td>
                  <span className={`${estilos.etiqueta} ${estilos[a.situacao]}`}>{SITUACOES_ALERTA[a.situacao]}</span>
                  {fixoAteReconhecer(a) && <span className={estilos.fixo}>fixo até reconhecer</span>}
                </td>
                <td className={estilos.acoes}>
                  {a.situacao === 'aberto' ? (
                    <Botao variante="primario" disabled title={`Previsto: ${textoPrevisao(RECONHECER)}`}>
                      Reconhecer&nbsp;<Previsto previsao={RECONHECER} />
                    </Botao>
                  ) : (
                    <Botao disabled title={`Previsto: ${textoPrevisao(ABRIR_OCORRENCIA)}`}>
                      Abrir&nbsp;<Previsto previsao={ABRIR_OCORRENCIA} />
                    </Botao>
                  )}
                  <Botao variante="link" disabled title={`Previsto: ${textoPrevisao(RECONHECER)}`}>
                    Detalhes
                  </Botao>
                </td>
              </tr>
            ))}
            {alertas?.length === 0 && (
              <tr>
                <td colSpan={8} className={estilos.semDados}>
                  {visao === 'encerrados_hoje' ? 'Nenhum alerta encerrado hoje.' : 'Nenhum alerta nesta visão.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

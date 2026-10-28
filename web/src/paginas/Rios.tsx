import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GRAVIDADES } from '../alertas/modelo';
import { Aviso } from '../componentes/Aviso';
import { GraficoLinha } from '../componentes/GraficoLinha';
import { Simulado } from '../componentes/Simulado';
import { SITUACOES } from '../dispositivos/modelo';
import { PontoRio, Rios as DadosRios, riosApi } from '../rios/modelo';
import { useAlertasAoVivo, useEventoAoVivo } from '../tempo-real/tempoReal';
import estilos from './Rios.module.css';

const ATUALIZACAO_MS = 30_000;
const SEIS_HORAS_MS = 6 * 3_600_000;

const numero = (valor: number, casas: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(valor);
const hora = (instante: string) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(instante));
const diaMes = (data: string) => data.slice(8, 10);
const meioDia = (data: string) => new Date(`${data}T12:00:00-03:00`).getTime();
const sinal = (valor: number, casas: number) => `${valor > 0 ? '+' : valor < 0 ? '−' : ''}${numero(Math.abs(valor), casas)}`;

function textoNivel(p: PontoRio): string {
  if (p.situacao === 'inativo') return 'sensor inativo neste ponto';
  if (!p.nivel) return 'o sensor nunca enviou leitura';
  if (p.situacao === 'sem_comunicacao') return `sem leitura desde ${hora(p.nivel.dataHora)}`;
  return '';
}

function Cartao({ ponto: p, cota, agora }: { ponto: PontoRio; cota: DadosRios['cota']; agora: number }) {
  const acima = p.nivel && cota ? p.nivel.valor > cota.valor : false;
  const alerta = p.alertaAtivo === 'grave' || p.alertaAtivo === 'atencao' ? p.alertaAtivo : null;
  const atual = p.situacao !== 'inativo' && p.situacao !== 'sem_comunicacao' ? p.nivel : null;
  // escala do trilho: a cota fica em 80% da largura
  const escala = cota ? cota.valor / 0.8 : null;
  const ontem = p.serieVazao.length >= 2 ? p.serieVazao[p.serieVazao.length - 2] : null;
  const pico = p.previsao.reduce<PontoRio['previsao'][number] | null>((m, v) => (!m || v.valor > m.valor ? v : m), null);
  const maiorVazao = Math.max(1, ...p.serieVazao.map((v) => v.valor), ...p.previsao.map((v) => v.valor));

  return (
    <article className={[estilos.rio, alerta && estilos[alerta]].filter(Boolean).join(' ')}>
      <header className={estilos.cabecalho}>
        <h2>{p.nome}</h2>
        <span className={estilos.apoio}>{[p.bairro, p.complemento].filter(Boolean).join(' · ')}</span>
        {alerta ? (
          <span className={`${estilos.etiqueta} ${estilos[alerta]}`}>Alerta {GRAVIDADES[alerta].toLowerCase()}</span>
        ) : (
          p.situacao !== 'operando' && <span className={`${estilos.etiqueta} ${estilos.parado}`}>{SITUACOES[p.situacao]}</span>
        )}
      </header>

      <div className={estilos.medidas}>
        <div>
          <div className={estilos.rotulo}>
            Nível do sensor <span className={estilos.codigo}>{p.identificador}</span>
            {p.simulado && <Simulado />}
          </div>
          <div className={[estilos.valor, acima && estilos.acima, !atual && estilos.vazio].filter(Boolean).join(' ')}>
            <b className="numero">{atual ? numero(atual.valor, 2) : '–'}</b>
            {atual && <i>m</i>}
          </div>
          <div className={estilos.trilho}>
            {atual && escala && <span className={acima ? estilos.cheioAcima : estilos.cheio} style={{ width: `${Math.min(100, (atual.valor / escala) * 100)}%` }} />}
            {cota && <i className={estilos.cota} style={{ left: '80%' }} />}
          </div>
          <div className={[estilos.nota, acima && estilos.acima].filter(Boolean).join(' ')}>
            {atual
              ? [p.tendencia !== null ? `${sinal(p.tendencia, 2)} m na última hora` : 'sem leitura de uma hora atrás', cota && `cota ${numero(cota.valor, 2)} m`]
                  .filter(Boolean)
                  .join(' · ')
              : textoNivel(p)}
          </div>
        </div>
        <div>
          <div className={estilos.rotulo}>Vazão (Open-Meteo)</div>
          <div className={[estilos.valor, !p.vazao && estilos.vazio].filter(Boolean).join(' ')}>
            <b className="numero">{p.vazao ? numero(p.vazao.valor, 1) : '–'}</b>
            {p.vazao && <i>m³/s</i>}
          </div>
          <div className={estilos.trilho}>{p.vazao && <span className={estilos.vazao} style={{ width: `${(p.vazao.valor / maiorVazao) * 100}%` }} />}</div>
          <div className={estilos.nota}>
            {p.vazao
              ? pico && pico.valor > p.vazao.valor
                ? `previsão de pico ${numero(pico.valor, 1)} m³/s no dia ${diaMes(pico.data)}`
                : ontem
                  ? `${sinal(p.vazao.valor - ontem.valor, 1)} m³/s desde ontem`
                  : 'primeiro dia coletado'
              : 'sem coleta para este ponto'}
          </div>
        </div>
      </div>

      <div className={estilos.grafico}>
        {p.situacao !== 'inativo' && p.serieNivel.length > 0 ? (
          <>
            <div className={estilos.legendaGrafico}>
              <span>Nível nas últimas 6 horas, média por 10 min</span>
              {cota && <span>cota {numero(cota.valor, 2)} m</span>}
            </div>
            <GraficoLinha
              rotulo={`Nível de ${p.nome} nas últimas 6 horas`}
              serie={p.serieNivel.map((s) => ({ x: new Date(s.dataHora).getTime(), y: s.valor }))}
              limite={cota ? { valor: cota.valor, rotulo: `${numero(cota.valor, 2)} m` } : null}
              xMinimo={agora - SEIS_HORAS_MS}
              xMaximo={agora}
              rotulosX={[6, 4, 2, 0].map((h) => ({ x: agora - h * 3_600_000, texto: hora(new Date(agora - h * 3_600_000).toISOString()) }))}
              casas={1}
            />
          </>
        ) : p.serieVazao.length > 0 ? (
          <>
            <div className={estilos.legendaGrafico}>
              <span>Vazão diária, últimos 7 dias e previsão</span>
            </div>
            <GraficoLinha
              rotulo={`Vazão de ${p.nome} na última semana e previsão`}
              serie={p.serieVazao.map((v) => ({ x: meioDia(v.data), y: v.valor }))}
              continuacao={p.previsao.map((v) => ({ x: meioDia(v.data), y: v.valor }))}
              xMinimo={meioDia(p.serieVazao[0].data)}
              xMaximo={meioDia((p.previsao.at(-1) ?? p.serieVazao.at(-1)!).data)}
              rotulosX={[...p.serieVazao, ...p.previsao].map((v) => ({ x: meioDia(v.data), texto: diaMes(v.data) }))}
              casas={1}
            />
          </>
        ) : (
          <p className={estilos.semGrafico}>Sem leituras para o gráfico.</p>
        )}
      </div>

      <footer className={estilos.rodape}>
        <span>{cota ? `Regra "${cota.regra}"` : 'Nenhuma regra de cota ativa'}</span>
        <span>{atual ? `leitura há ${Math.max(0, Math.round((agora - new Date(atual.dataHora).getTime()) / 1000))} s` : p.vazao ? 'só Open-Meteo' : ''}</span>
      </footer>
    </article>
  );
}

export function Rios() {
  const [dados, setDados] = useState<DadosRios | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [agora, setAgora] = useState(() => Date.now());

  const carregar = useCallback(async () => {
    try {
      setDados(await riosApi.consultar());
      setAgora(Date.now());
      setErro(null);
    } catch {
      setErro('Não foi possível carregar os rios.');
    }
  }, []);

  useAlertasAoVivo(carregar);
  useEventoAoVivo('coleta:open-meteo', carregar);
  useEventoAoVivo('leitura:nova', (dados) => {
    const leitura = dados as { grandezas?: string[] };
    if (leitura.grandezas?.includes('nivel_agua')) carregar();
  });

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, ATUALIZACAO_MS);
    const relogio = setInterval(() => setAgora(Date.now()), 1_000);
    return () => {
      clearInterval(intervalo);
      clearInterval(relogio);
    };
  }, [carregar]);

  const coleta = dados?.coleta;
  const falhou = coleta?.erro && coleta.ultimaTentativa;

  return (
    <div className={estilos.pagina}>
      <div className={estilos.titulo}>
        <h1>Rios</h1>
        {dados && (
          <span className={estilos.resumo}>
            {dados.pontos.length} {dados.pontos.length === 1 ? 'ponto monitorado' : 'pontos monitorados'} · Open-Meteo{' '}
            {coleta?.ultimaColeta ? `coletado às ${hora(coleta.ultimaColeta)}` : 'ainda sem coleta'}
          </span>
        )}
        <Link className={estilos.voltar} to="/painel">
          Voltar ao painel
        </Link>
      </div>

      {erro && <Aviso>{erro}</Aviso>}
      {falhou && (
        <p className={estilos.avisoAtencao} role="status">
          O Open-Meteo não respondeu na coleta das {hora(coleta.ultimaTentativa!)}.{' '}
          {coleta.ultimaColeta ? `A vazão mostrada é a da coleta das ${hora(coleta.ultimaColeta)}.` : 'Ainda não há vazão coletada.'} Nova tentativa na
          próxima hora.
        </p>
      )}

      <div className={estilos.rios}>
        {dados?.pontos.map((p) => <Cartao key={p.dispositivoId} ponto={p} cota={dados.cota} agora={agora} />)}
        {dados?.pontos.length === 0 && <p className={estilos.semGrafico}>Nenhum sensor de nível de água cadastrado.</p>}
      </div>
      <p className={estilos.atribuicao}>Vazão: Open-Meteo Flood API, dados GloFAS do Copernicus (CC BY 4.0).</p>
    </div>
  );
}

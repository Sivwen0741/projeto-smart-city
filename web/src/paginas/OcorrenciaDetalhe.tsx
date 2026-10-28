import { FormEvent, useCallback, useEffect, useId, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GRAVIDADES, medida } from '../alertas/modelo';
import { Aviso } from '../componentes/Aviso';
import { Botao } from '../componentes/Botao';
import { MapaPonto } from '../componentes/MapaPonto';
import { Previsao, Previsto, textoPrevisao } from '../componentes/Previsto';
import { DetalheOcorrencia, ocorrenciasApi, RegistroHistorico, SITUACOES_OCORRENCIA, tempoEmAberto } from '../ocorrencias/modelo';
import { ErroApi } from '../sessao/api';
import { useAlertasAoVivo } from '../tempo-real/tempoReal';
import estilos from './OcorrenciaDetalhe.module.css';

const EXPORTAR: Previsao = { historia: 'US25', sprint: 'backlog' };

const ORIGENS: Record<string, string> = { telefone: 'Telefone', alerta: 'Alerta automático' };

const formato = (opcoes: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('pt-BR', opcoes);
const hora = (instante: string) => formato({ hour: '2-digit', minute: '2-digit' }).format(new Date(instante));
const diaHora = (instante: string) => `${formato({ day: '2-digit', month: '2-digit' }).format(new Date(instante))} às ${hora(instante)}`;
const mesmoDia = (a: string, b: number) => new Date(a).toDateString() === new Date(b).toDateString();

function tituloDoRegistro(r: RegistroHistorico): string {
  if (r.tipo === 'alerta_gerado') return 'Alerta gerado automaticamente';
  if (r.tipo === 'alerta_reconhecido') return 'Alerta reconhecido';
  if (r.situacaoAnterior === null) return 'Ocorrência registrada';
  if (r.situacaoNova === 'encerrada') return 'Ocorrência encerrada';
  if (r.situacaoAnterior === 'aberta' && r.situacaoNova === 'em_atendimento') return 'Atendimento iniciado';
  return 'Providência registrada';
}

function textoDoRegistro(r: RegistroHistorico): string | null {
  if (r.tipo === 'alerta_gerado' && r.alerta) {
    const { dispositivo, valorObservado, valorLimite, operador, unidade } = r.alerta;
    const sentido = operador.startsWith('<') ? 'abaixo' : 'acima';
    return `${dispositivo} registrou ${medida(valorObservado, unidade)}, ${sentido} do limite de ${medida(valorLimite, unidade)}.`;
  }
  return r.observacao;
}

function rodapeDoRegistro(r: RegistroHistorico): string | null {
  if (r.tipo === 'alerta_gerado') return r.alerta ? `Regra "${r.alerta.regra}"` : null;
  return [r.autor, r.orgaoAutor].filter(Boolean).join(' · ') || null;
}

export function OcorrenciaDetalhe() {
  const { id = '' } = useParams();
  const idProvidencia = useId();
  const [ocorrencia, setOcorrencia] = useState<DetalheOcorrencia | null>(null);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [agora, setAgora] = useState(() => Date.now());
  const [texto, setTexto] = useState('');
  const [erroTexto, setErroTexto] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<'providencia' | 'encerrar' | null>(null);

  const carregar = useCallback(async () => {
    try {
      setOcorrencia(await ocorrenciasApi.detalhe(id));
      setAgora(Date.now());
      setErro(null);
    } catch (e) {
      if (e instanceof ErroApi && e.status === 404) setNaoEncontrada(true);
      else setErro('Não foi possível carregar a ocorrência.');
    }
  }, [id]);

  useAlertasAoVivo(carregar);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(intervalo);
  }, [carregar]);

  async function enviar(acao: 'providencia' | 'encerrar', evento?: FormEvent) {
    evento?.preventDefault();
    if (!texto.trim()) {
      setErroTexto(acao === 'encerrar' ? 'Escreva a observação de encerramento.' : 'Escreva a providência.');
      return;
    }
    setEnviando(acao);
    setErroTexto(null);
    try {
      await ocorrenciasApi.registrarProvidencia(id, texto.trim(), acao === 'encerrar' ? 'encerrada' : undefined);
      setTexto('');
      await carregar();
    } catch (e) {
      setErroTexto(e instanceof ErroApi ? e.message : 'Não foi possível registrar. Tente de novo.');
      if (e instanceof ErroApi && e.status === 409) await carregar();
    } finally {
      setEnviando(null);
    }
  }

  if (naoEncontrada) {
    return (
      <div className={estilos.pagina}>
        <div className={estilos.voltar}>
          <Link to="/ocorrencias">Voltar para ocorrências</Link>
        </div>
        <Aviso>Ocorrência não encontrada.</Aviso>
      </div>
    );
  }

  const o = ocorrencia;
  const encerrada = o?.situacao === 'encerrada';
  const fimDaContagem = o?.dataEncerramento ? new Date(o.dataEncerramento).getTime() : agora;

  return (
    <div className={estilos.pagina}>
      <div className={estilos.voltar}>
        <Link to="/ocorrencias">Voltar para ocorrências</Link>
        {o && (
          <span className={estilos.contexto}>
            Protocolo {o.protocolo},{' '}
            {encerrada ? `encerrada em ${diaHora(o.dataEncerramento!)}` : `aberta há ${tempoEmAberto(o.dataAbertura, agora)}`}
          </span>
        )}
      </div>

      {erro && <Aviso>{erro}</Aviso>}

      {o && (
        <div className={estilos.grade}>
          <div className={estilos.coluna}>
            <section className={estilos.cabecalho}>
              <div className={estilos.titulo}>
                <span className={`${estilos.gravidade} ${estilos[o.criticidade]}`}>{GRAVIDADES[o.criticidade]}</span>
                <h1>{o.categoria}</h1>
                <span className={estilos.protocolo}>Protocolo {o.protocolo}</span>
              </div>
              <dl className={estilos.campos}>
                <div>
                  <dt>Situação</dt>
                  <dd>{SITUACOES_OCORRENCIA[o.situacao] ?? o.situacao}</dd>
                </div>
                <div>
                  <dt>Categoria</dt>
                  <dd>{o.categoria}</dd>
                </div>
                <div>
                  <dt>Bairro</dt>
                  <dd>{o.bairro ?? 'Zona rural'}</dd>
                </div>
                <div>
                  <dt>Abertura</dt>
                  <dd className="numero">{diaHora(o.dataAbertura)}</dd>
                </div>
                <div>
                  <dt>{encerrada ? 'Tempo até o encerramento' : 'Tempo em aberto'}</dt>
                  <dd className="numero">{tempoEmAberto(o.dataAbertura, fimDaContagem)}</dd>
                </div>
                <div>
                  <dt>Órgão responsável</dt>
                  <dd>{o.orgao ?? '–'}</dd>
                </div>
              </dl>
            </section>

            <div className={estilos.linha}>
              <section className={`${estilos.caixa} ${estilos.descricao}`}>
                <h2>Descrição</h2>
                <p>{o.descricao ?? 'Sem descrição.'}</p>
              </section>
              <section className={`${estilos.caixa} ${estilos.localizacao}`}>
                <h2>Localização</h2>
                <div className={estilos.mapa}>
                  {o.latitude !== null && o.longitude !== null ? (
                    <MapaPonto ponto={{ latitude: o.latitude, longitude: o.longitude }} rotulo={`Local da ocorrência ${o.protocolo}`} />
                  ) : (
                    <p className={estilos.semLocal}>Sem localização.</p>
                  )}
                  <div className={estilos.endereco}>
                    <strong>{o.endereco ?? 'Endereço não informado'}</strong>
                    <span>{o.bairro ?? 'Zona rural'}</span>
                  </div>
                </div>
              </section>
            </div>

            <section className={`${estilos.caixa} ${estilos.historico}`}>
              <header className={estilos.cabecalhoHistorico}>
                <h2>Histórico do atendimento</h2>
                <span className={estilos.contagem}>
                  {o.historico.length} {o.historico.length === 1 ? 'registro' : 'registros'}
                </span>
                <span className={estilos.previsto} aria-disabled="true" title={`Previsto: ${textoPrevisao(EXPORTAR)}`}>
                  Exportar <Previsto previsao={EXPORTAR} />
                </span>
              </header>
              <ol className={estilos.registros}>
                {o.historico.map((r, i) => {
                  const rodape = rodapeDoRegistro(r);
                  const corpo = textoDoRegistro(r);
                  return (
                    <li key={i} className={r.tipo === 'alerta_gerado' ? estilos[o.criticidade] : undefined}>
                      <time className="numero" dateTime={r.dataHora} title={diaHora(r.dataHora)}>
                        {mesmoDia(r.dataHora, agora) ? hora(r.dataHora) : diaHora(r.dataHora)}
                      </time>
                      <span className={estilos.marco} aria-hidden="true" />
                      <div>
                        <h3>{tituloDoRegistro(r)}</h3>
                        {corpo && <p>{corpo}</p>}
                        {rodape && <p className={estilos.autor}>{rodape}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>

          <aside className={estilos.lateral}>
            <section className={estilos.caixa}>
              <h2 className={estilos.tituloLateral}>Dados da ocorrência</h2>
              <dl className={estilos.ficha}>
                <dt>Registrada por</dt>
                <dd>{o.registradaPor ?? '–'}</dd>
                <dt>Responsável</dt>
                <dd>{o.responsavel ?? '–'}</dd>
                <dt>Órgão</dt>
                <dd>{o.orgao ?? '–'}</dd>
                <dt>Origem</dt>
                <dd>{ORIGENS[o.origem] ?? o.origem}</dd>
                <dt>Dispositivo</dt>
                <dd>{o.alertas.at(-1)?.dispositivo ?? '–'}</dd>
                <dt>Alertas vinculados</dt>
                <dd className="numero">{o.alertas.length}</dd>
              </dl>
            </section>

            <section className={estilos.caixa}>
              <h2 className={estilos.tituloLateral}>Atualizar atendimento</h2>
              {encerrada ? (
                <p className={estilos.encerrada}>Encerrada em {diaHora(o.dataEncerramento!)}. A ocorrência continua consultável, sem novas atualizações.</p>
              ) : (
                <form className={estilos.atualizar} onSubmit={(e) => enviar('providencia', e)} noValidate>
                  <label className={estilos.rotulo} htmlFor={idProvidencia}>
                    Providência
                  </label>
                  <textarea
                    id={idProvidencia}
                    className={estilos.texto}
                    value={texto}
                    maxLength={2000}
                    aria-invalid={erroTexto ? true : undefined}
                    onChange={(e) => {
                      setTexto(e.target.value);
                      setErroTexto(null);
                    }}
                  />
                  {erroTexto && <span className={estilos.erro}>{erroTexto}</span>}
                  <Botao type="submit" variante="primario" largo disabled={enviando !== null}>
                    {enviando === 'providencia' ? 'Registrando…' : 'Registrar providência'}
                  </Botao>
                  <Botao type="button" variante="secundario" largo disabled={enviando !== null} onClick={() => enviar('encerrar')}>
                    {enviando === 'encerrar' ? 'Encerrando…' : 'Encerrar ocorrência'}
                  </Botao>
                  <p className={estilos.dica}>
                    {o.situacao === 'aberta'
                      ? 'A primeira providência passa a ocorrência para em atendimento.'
                      : 'Encerrar usa o texto acima como observação e encerra os alertas vinculados ainda em atendimento.'}
                  </p>
                </form>
              )}
            </section>

            <section className={estilos.caixa}>
              <h2 className={estilos.tituloLateral}>
                Alertas vinculados <span className={estilos.contagem}>{o.alertas.length}</span>
              </h2>
              <ul className={estilos.alertas}>
                {o.alertas.map((a) => (
                  <li key={a.id} className={estilos[a.criticidade]}>
                    <div className={estilos.alertaLinha}>
                      <strong>{a.regra}</strong>
                      <time className="numero">{hora(a.dataHora)}</time>
                    </div>
                    <span className={estilos.autor}>
                      {a.dispositivo} · {medida(a.valorObservado, a.unidade)}
                    </span>
                  </li>
                ))}
                {o.alertas.length === 0 && <li className={estilos.vazio}>Nenhum alerta vinculado.</li>}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

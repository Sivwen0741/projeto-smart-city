import { FormEvent, useId, useState } from 'react';
import { Alerta, alertasApi, GRAVIDADES, limite, lugar, medida, SITUACOES_ALERTA } from '../alertas/modelo';
import { Botao } from '../componentes/Botao';
import { Previsao, Previsto, textoPrevisao } from '../componentes/Previsto';
import { tempoDesde } from '../dispositivos/modelo';
import { ErroApi } from '../sessao/api';
import estilos from './PainelReconhecimento.module.css';

const ABRIR_OCORRENCIA: Previsao = { historia: 'US05', sprint: 'sprint 5' };

const quando = (instante: string) =>
  new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(instante));

interface Props {
  alerta: Alerta;
  aoReconhecer: (alerta: Alerta) => void;
  aoFechar: () => void;
}

export function PainelReconhecimento({ alerta, aoReconhecer, aoFechar }: Props) {
  const id = useId();
  const [providencia, setProvidencia] = useState('');
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [recusa, setRecusa] = useState<{ mensagem: string; alerta: Alerta | null } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [gravado, setGravado] = useState(false);

  const vazia = providencia.trim() === '';
  // outro operador reconheceu pelo tempo real enquanto este escrevia
  const perdida =
    !recusa && !gravado && !vazia && alerta.situacao !== 'aberto'
      ? alerta.situacao === 'encerrado'
        ? 'Este alerta foi encerrado enquanto você escrevia. A sua providência não foi gravada.'
        : `Este alerta foi reconhecido por ${alerta.reconhecidoPor ?? 'outro operador'}${alerta.dataReconhecimento ? ` às ${quando(alerta.dataReconhecimento)}` : ''} enquanto você escrevia. A sua providência não foi gravada.`
      : null;
  const aviso = recusa?.mensagem ?? perdida;
  const atual = recusa?.alerta ?? alerta;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setTentou(true);
    if (vazia) return;
    setEnviando(true);
    setErro(null);
    try {
      const reconhecido = await alertasApi.reconhecer(alerta.id, providencia);
      setGravado(true);
      aoReconhecer(reconhecido);
    } catch (e) {
      if (e instanceof ErroApi && e.status === 409) {
        setRecusa({ mensagem: e.message, alerta: (e.corpo as { alerta?: Alerta })?.alerta ?? null });
        if ((e.corpo as { alerta?: Alerta })?.alerta) aoReconhecer((e.corpo as { alerta: Alerta }).alerta);
      } else setErro(e instanceof ErroApi ? e.message : 'Não foi possível reconhecer o alerta. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  const ficha = (
    <dl className={estilos.ficha}>
      <dt>Dispositivo</dt>
      <dd>
        {alerta.dispositivo} · {alerta.tipoDispositivo.toLowerCase()}
      </dd>
      <dt>Local</dt>
      <dd>{lugar(alerta) || '–'}</dd>
      <dt>Medição</dt>
      <dd>
        <span className={`${estilos.medida} numero`}>{medida(alerta.valorObservado, alerta.unidade)}</span>{' '}
        <span className={estilos.apoio}>
          limite {alerta.operador} {limite(alerta)}
        </span>
      </dd>
      <dt>Detecção</dt>
      <dd>
        {quando(alerta.dataHora)} · {tempoDesde(alerta.dataHora, Date.now())}
      </dd>
    </dl>
  );

  const reconhecimento = atual.dataReconhecimento && (
    <dl className={estilos.ficha}>
      <dt>Reconhecido</dt>
      <dd>
        {atual.reconhecidoPor ?? '–'} · {quando(atual.dataReconhecimento)}
      </dd>
      <dt>Providência</dt>
      <dd>{atual.providencia}</dd>
    </dl>
  );

  if (alerta.situacao !== 'aberto' || recusa) {
    return (
      <aside className={estilos.painel} aria-label="Alerta">
        <header className={estilos.cabecalho}>
          <h2>{aviso ? 'Reconhecer alerta' : alerta.situacao === 'encerrado' ? 'Alerta encerrado' : 'Alerta reconhecido'}</h2>
          <Botao variante="link" onClick={aoFechar}>
            Fechar
          </Botao>
        </header>
        <div className={estilos.corpo}>
          {aviso ? (
            <p className={estilos.recusa} role="alert">
              {aviso}
            </p>
          ) : (
            <span className={`${estilos.etiqueta} ${estilos[atual.situacao]}`}>{SITUACOES_ALERTA[atual.situacao]}</span>
          )}
          <span className={`${estilos.gravidade} ${estilos[alerta.criticidade]}`}>{GRAVIDADES[alerta.criticidade]}</span>
          <h3 className={estilos.nome}>{alerta.regra}</h3>
          {reconhecimento}
          {ficha}
        </div>
      </aside>
    );
  }

  return (
    <aside className={estilos.painel} aria-label="Reconhecer alerta">
      <header className={estilos.cabecalho}>
        <h2>Reconhecer alerta</h2>
        <Botao variante="link" onClick={aoFechar}>
          Fechar
        </Botao>
      </header>
      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <div className={estilos.corpo}>
          <span className={`${estilos.gravidade} ${estilos[alerta.criticidade]}`}>{GRAVIDADES[alerta.criticidade]}</span>
          <h3 className={estilos.nome}>{alerta.regra}</h3>
          {ficha}
          <div className={estilos.campo}>
            <label className={estilos.rotulo} htmlFor={id}>
              Providência adotada
            </label>
            <textarea
              id={id}
              className={estilos.area}
              value={providencia}
              maxLength={2000}
              placeholder="Descreva o que foi feito: quem foi acionado, o que foi confirmado."
              aria-invalid={tentou && vazia ? true : undefined}
              aria-describedby={tentou && vazia ? `${id}-erro` : undefined}
              onChange={(e) => setProvidencia(e.target.value)}
            />
            {tentou && vazia && (
              <span id={`${id}-erro`} className={estilos.erro}>
                Informe a providência adotada.
              </span>
            )}
          </div>
          <label className={estilos.previsto} aria-disabled="true" title={`Previsto: ${textoPrevisao(ABRIR_OCORRENCIA)}`}>
            <input type="checkbox" disabled /> Abrir ocorrência com este alerta <Previsto previsao={ABRIR_OCORRENCIA} />
          </label>
          <p className={estilos.nota}>Só um operador reconhece cada alerta. O reconhecimento fica no log de atividades com o seu nome.</p>
          {erro && (
            <p className={estilos.erro} role="alert">
              {erro}
            </p>
          )}
        </div>
        <footer className={estilos.rodape}>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" variante="primario" disabled={enviando}>
            {enviando ? 'Reconhecendo…' : 'Confirmar reconhecimento'}
          </Botao>
        </footer>
      </form>
    </aside>
  );
}

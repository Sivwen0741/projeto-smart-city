import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscaApi, MINIMO_CARACTERES, ResultadoBusca } from '../busca/modelo';
import { SITUACOES } from '../dispositivos/modelo';
import { SITUACOES_OCORRENCIA } from '../ocorrencias/modelo';
import estilos from './BuscaCabecalho.module.css';

interface Opcao {
  chave: string;
  destino: string;
}

const ESPERA_MS = 250;

export function BuscaCabecalho() {
  const navegar = useNavigate();
  const id = useId();
  const caixa = useRef<HTMLDivElement>(null);
  const [texto, setTexto] = useState('');
  const [aberta, setAberta] = useState(false);
  const [resultado, setResultado] = useState<ResultadoBusca | null>(null);
  const [erro, setErro] = useState(false);
  const [ativa, setAtiva] = useState(-1);
  const termo = texto.trim();
  const curto = termo.length < MINIMO_CARACTERES;

  useEffect(() => {
    setAtiva(-1);
    setErro(false);
    if (curto) {
      setResultado(null);
      return;
    }
    const controle = new AbortController();
    const espera = setTimeout(() => {
      buscaApi
        .buscar(termo, controle.signal)
        .then((r) => {
          setResultado(r);
          setErro(false);
        })
        .catch(() => {
          if (!controle.signal.aborted) setErro(true);
        });
    }, ESPERA_MS);
    return () => {
      clearTimeout(espera);
      controle.abort();
    };
  }, [termo, curto]);

  useEffect(() => {
    const fora = (e: MouseEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberta(false);
    };
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, []);

  const opcoes: Opcao[] = [
    ...(resultado?.ocorrencias ?? []).map((o) => ({ chave: `o${o.id}`, destino: `/ocorrencias/${o.id}` })),
    ...(resultado?.dispositivos ?? []).map((d) => ({ chave: `d${d.id}`, destino: `/dispositivos?id=${d.id}` })),
  ];
  const indice = (chave: string) => opcoes.findIndex((o) => o.chave === chave);

  function abrir(opcao: Opcao) {
    setAberta(false);
    setTexto('');
    navegar(opcao.destino);
  }

  function teclar(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setAberta(false);
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setAberta(true);
      if (opcoes.length === 0) return;
      const passo = e.key === 'ArrowDown' ? 1 : -1;
      setAtiva((a) => (a + passo + opcoes.length) % opcoes.length);
      return;
    }
    if (e.key === 'Enter' && ativa >= 0 && opcoes[ativa]) {
      e.preventDefault();
      abrir(opcoes[ativa]);
    }
  }

  const mostrar = aberta && termo.length > 0;
  const vazio = resultado !== null && opcoes.length === 0;
  const opcaoId = (chave: string) => `${id}-${chave}`;

  function item(chave: string, titulo: string, detalhe: string, local: string | null) {
    const i = indice(chave);
    return (
      <li
        key={chave}
        id={opcaoId(chave)}
        role="option"
        aria-selected={i === ativa}
        className={`${estilos.opcao} ${i === ativa ? estilos.ativa : ''}`}
        onMouseEnter={() => setAtiva(i)}
        onMouseDown={(e) => {
          e.preventDefault();
          abrir(opcoes[i]);
        }}
      >
        <span className={estilos.linha}>
          <strong className="numero">{titulo}</strong>
          <span>{detalhe}</span>
        </span>
        {local && <span className={estilos.local}>{local}</span>}
      </li>
    );
  }

  return (
    <div className={estilos.busca} ref={caixa}>
      <input
        type="search"
        className={estilos.caixa}
        placeholder="Buscar ocorrência"
        aria-label="Buscar ocorrência ou dispositivo por protocolo, endereço, bairro ou código"
        role="combobox"
        aria-expanded={mostrar}
        aria-controls={`${id}-lista`}
        aria-autocomplete="list"
        aria-activedescendant={ativa >= 0 && opcoes[ativa] ? opcaoId(opcoes[ativa].chave) : undefined}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setAberta(true);
        }}
        onFocus={() => setAberta(true)}
        onKeyDown={teclar}
      />
      {mostrar && (
        <div className={estilos.resultados}>
          {curto ? (
            <p className={estilos.aviso}>Digite pelo menos {MINIMO_CARACTERES} caracteres.</p>
          ) : erro ? (
            <p className={estilos.aviso}>Não foi possível buscar agora. Tente de novo.</p>
          ) : resultado === null ? (
            <p className={estilos.aviso}>Buscando…</p>
          ) : vazio ? (
            <p className={estilos.aviso}>Nada encontrado para “{termo}”.</p>
          ) : (
            <ul id={`${id}-lista`} role="listbox" aria-label="Resultados da busca" className={estilos.lista}>
              {resultado.ocorrencias.length > 0 && (
                <li role="presentation" className={estilos.grupo}>
                  Ocorrências
                </li>
              )}
              {resultado.ocorrencias.map((o) =>
                item(
                  `o${o.id}`,
                  o.protocolo,
                  `${o.categoria} · ${SITUACOES_OCORRENCIA[o.situacao] ?? o.situacao}`,
                  [o.endereco, o.bairro].filter(Boolean).join(', ') || null,
                ),
              )}
              {resultado.dispositivos.length > 0 && (
                <li role="presentation" className={estilos.grupo}>
                  Dispositivos
                </li>
              )}
              {resultado.dispositivos.map((d) =>
                item(
                  `d${d.id}`,
                  d.identificador,
                  `${d.tipo} · ${SITUACOES[d.situacao]}`,
                  [d.endereco, d.bairro ?? (d.distrito ? `Zona rural, ${d.distrito}` : null)].filter(Boolean).join(', ') || null,
                ),
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

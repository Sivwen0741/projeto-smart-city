import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilaAlertas } from '../componentes/FilaAlertas';
import { GraficoLinha } from '../componentes/GraficoLinha';
import { MapaCidade } from '../componentes/MapaCidade';
import { DadosPainel, Indicador, painelApi } from '../painel/modelo';
import { useAlertasAoVivo, useEventoAoVivo } from '../tempo-real/tempoReal';
import estilos from './Painel.module.css';

const ATUALIZACAO_MS = 30_000;
// leituras chegam a cada poucos segundos; o painel consulta no máximo a cada 5 s
const INTERVALO_MINIMO_MS = 5_000;

const numero = (valor: number, casas: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(valor);

function Peca({ indicador: i }: { indicador: Indicador }) {
  const conteudo = (
    <>
      <span className={estilos.nome}>{i.nome}</span>
      <span className={estilos.linhaValor}>
        <span className={`${estilos.valor} numero`}>
          {i.valor === null ? '–' : numero(i.valor, i.casas)}
          {i.valor !== null && <small>{i.unidade}</small>}
        </span>
        {i.variacao && <span className={estilos.variacao}>{i.variacao}</span>}
      </span>
      <span className={estilos.trilho}>{i.proporcao !== null && <span style={{ width: `${i.proporcao * 100}%` }} />}</span>
      <span className={estilos.nota}>{i.nota}</span>
    </>
  );
  const classes = [estilos.servico, estilos[i.estado]].join(' ');
  // a tela de rios (us09) abre pelo indicador, sem aba nova no menu
  return i.chave === 'rios' ? (
    <li className={classes}>
      <Link className={estilos.abrirRios} to="/rios" title="Abrir a tela de rios">
        {conteudo}
      </Link>
    </li>
  ) : (
    <li className={classes}>{conteudo}</li>
  );
}

export function Painel() {
  const [dados, setDados] = useState<DadosPainel | null>(null);
  const ultima = useRef(0);
  const pendente = useRef<ReturnType<typeof setTimeout> | null>(null);

  const carregar = useCallback(async () => {
    ultima.current = Date.now();
    try {
      setDados(await painelApi.consultar());
    } catch {
      // mantém os últimos valores; a próxima consulta tenta de novo
    }
  }, []);

  const pedir = useCallback(() => {
    if (pendente.current) return;
    const espera = Math.max(0, ultima.current + INTERVALO_MINIMO_MS - Date.now());
    pendente.current = setTimeout(() => {
      pendente.current = null;
      carregar();
    }, espera);
  }, [carregar]);

  useAlertasAoVivo(pedir);
  useEventoAoVivo('leitura:nova', pedir);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, ATUALIZACAO_MS);
    return () => {
      clearInterval(intervalo);
      if (pendente.current) clearTimeout(pendente.current);
    };
  }, [carregar]);

  const horas = dados?.ocorrenciasHoje ?? [];
  const agora = horas.filter((h) => h.hoje !== null).at(-1)?.hora ?? 0;
  const maiorBairro = Math.max(1, ...(dados?.ocorrenciasPorBairro.map((b) => b.total) ?? []));

  return (
    <div className={estilos.painel}>
      <ul className={estilos.faixa} aria-label="Indicadores da cidade">
        {dados?.indicadores.map((i) => <Peca key={i.chave} indicador={i} />)}
      </ul>

      <div className={estilos.mapa}>
        <MapaCidade />
      </div>

      <div className={estilos.tira}>
        <section className={estilos.grafico}>
          <header className={estilos.cabecalhoGrafico}>
            <div>
              <h2>Ocorrências abertas hoje</h2>
              <p className={estilos.subtitulo}>contra a média dos quatro mesmos dias da semana anteriores</p>
            </div>
            <ul className={estilos.legenda}>
              <li className={estilos.hoje}>hoje</li>
              <li className={estilos.media}>média</li>
            </ul>
          </header>
          {horas.length > 0 && (
            <GraficoLinha
              rotulo="Ocorrências abertas hoje, acumuladas por hora, contra a média"
              serie={horas.filter((h) => h.hoje !== null).map((h) => ({ x: h.hora, y: h.hoje! }))}
              referencia={horas.filter((h) => h.hora <= Math.max(agora, 1)).map((h) => ({ x: h.hora, y: h.media }))}
              xMinimo={0}
              xMaximo={Math.max(agora, 1)}
              rotulosX={[0, 3, 6, 9, 12, 15, 18, 21].filter((h) => h <= agora).concat(agora % 3 >= 2 ? [agora] : []).map((h) => ({ x: h, texto: String(h).padStart(2, '0') }))}
              altura={80}
              piso={0}
              casas={0}
            />
          )}
        </section>
        <section className={estilos.grafico}>
          <header className={estilos.cabecalhoGrafico}>
            <div>
              <h2>Ocorrências por bairro</h2>
              <p className={estilos.subtitulo}>acumulado das últimas 24 horas</p>
            </div>
          </header>
          <ul className={estilos.barras}>
            {dados?.ocorrenciasPorBairro.map((b) => (
              <li key={b.bairro}>
                <span>{b.bairro}</span>
                <span className={estilos.barra}>
                  <span style={{ width: `${(b.total / maiorBairro) * 100}%` }} />
                </span>
                <span className="numero">{b.total}</span>
              </li>
            ))}
            {dados?.ocorrenciasPorBairro.length === 0 && <li className={estilos.semOcorrencias}>Nenhuma ocorrência nas últimas 24 horas.</li>}
          </ul>
        </section>
      </div>

      <div className={estilos.fila}>
        <FilaAlertas />
      </div>
    </div>
  );
}

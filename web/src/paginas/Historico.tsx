import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { medida } from '../alertas/modelo';
import { Aviso } from '../componentes/Aviso';
import { GraficoLinha } from '../componentes/GraficoLinha';
import { Segmentado } from '../componentes/Segmentado';
import { Selecao } from '../componentes/Selecao';
import { dispositivosApi, Historico as DadosHistorico, PeriodoHistorico } from '../dispositivos/modelo';
import { OPERADORES } from '../regras/modelo';
import { ErroApi } from '../sessao/api';
import estilos from './Historico.module.css';

const PERIODOS: { valor: PeriodoHistorico; rotulo: string }[] = [
  { valor: '24h', rotulo: '24 h' },
  { valor: '7d', rotulo: '7 dias' },
  { valor: '30d', rotulo: '30 dias' },
];

const HORA_MS = 3_600_000;

const hora = (t: number) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dia = (t: number) => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

function rotulosX(d: DadosHistorico) {
  const inicio = new Date(d.inicio).getTime();
  const fim = new Date(d.fim).getTime();
  const passos = d.periodo === '24h' ? [24, 18, 12, 6, 0] : d.periodo === '7d' ? [7, 5, 3, 1, 0].map((n) => n * 24) : [30, 22, 15, 7, 0].map((n) => n * 24);
  return passos.map((h) => fim - h * HORA_MS).filter((t) => t >= inicio).map((t) => ({ x: t, texto: d.periodo === '24h' ? hora(t) : dia(t) }));
}

export function Historico() {
  const { id = '' } = useParams();
  const [periodo, setPeriodo] = useState<PeriodoHistorico>('24h');
  const [grandeza, setGrandeza] = useState<string | undefined>(undefined);
  const [dados, setDados] = useState<DadosHistorico | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setDados(await dispositivosApi.historico(id, periodo, grandeza));
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível carregar o histórico.');
    }
  }, [id, periodo, grandeza]);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 60_000);
    return () => clearInterval(intervalo);
  }, [carregar]);

  const casas = dados?.pontos.some((p) => Math.abs(p.media) < 10) ? 2 : 1;
  const agregado = dados && dados.periodo !== '24h';
  const operador = (o: string) => OPERADORES.find((x) => x.valor === o)?.rotulo ?? o;

  return (
    <div className={estilos.pagina}>
      <div className={estilos.titulo}>
        <h1>Histórico {dados ? `de ${dados.identificador}` : ''}</h1>
        {dados?.rotulo && (
          <span className={estilos.resumo}>
            {dados.rotulo}
            {dados.unidade ? `, em ${dados.unidade}` : ''}
          </span>
        )}
        <Link className={estilos.voltar} to={`/dispositivos?id=${id}`}>
          Voltar para o dispositivo
        </Link>
      </div>

      {erro && <Aviso>{erro}</Aviso>}

      <div className={estilos.ferramentas}>
        <div className={estilos.periodo}>
          <Segmentado rotulo="Período" opcoes={PERIODOS} valor={periodo} aoMudar={setPeriodo} />
        </div>
        {dados && dados.grandezas.length > 1 && (
          <Selecao
            rotulo="Grandeza"
            className={estilos.grandeza}
            opcoes={dados.grandezas.map((g) => ({ valor: g.codigo, rotulo: g.rotulo }))}
            value={dados.grandeza ?? ''}
            onChange={(e) => setGrandeza(e.target.value)}
          />
        )}
      </div>

      {dados && (
        <section className={estilos.caixa} aria-label="Gráfico histórico">
          {dados.pontos.length === 0 ? (
            <p className={estilos.vazio}>{dados.grandeza ? 'Sem leituras neste período.' : 'Este dispositivo ainda não enviou leituras.'}</p>
          ) : (
            <>
              <div className={estilos.legenda}>
                <span>
                  {agregado ? 'Média por hora, com a faixa entre o mínimo e o máximo' : 'Média por 5 min'} · {dados.pontos.length}{' '}
                  {dados.pontos.length === 1 ? 'ponto' : 'pontos'} de {dados.pontos.reduce((s, p) => s + p.leituras, 0)} leituras
                </span>
              </div>
              <GraficoLinha
                rotulo={`${dados.rotulo} de ${dados.identificador}`}
                serie={dados.pontos.map((p) => ({ x: new Date(p.inicio).getTime() + (dados.blocoMinutos * 60_000) / 2, y: p.media }))}
                faixa={agregado ? dados.pontos.map((p) => ({ x: new Date(p.inicio).getTime() + (dados.blocoMinutos * 60_000) / 2, minimo: p.minimo, maximo: p.maximo })) : []}
                limites={dados.limites.map((l) => ({ valor: l.valor, rotulo: medida(l.valor, dados.unidade) }))}
                xMinimo={new Date(dados.inicio).getTime()}
                xMaximo={new Date(dados.fim).getTime()}
                rotulosX={rotulosX(dados)}
                altura={220}
                casas={casas}
              />
            </>
          )}
          <footer className={estilos.rodape}>
            {dados.limites.length > 0
              ? dados.limites.map((l) => (
                  <span key={l.regra}>
                    <i className={estilos.tracejado} /> {l.regra}: {operador(l.operador)} {medida(l.valor, dados.unidade)}
                  </span>
                ))
              : dados.grandeza && <span>Nenhuma regra ativa para esta grandeza.</span>}
          </footer>
        </section>
      )}
    </div>
  );
}

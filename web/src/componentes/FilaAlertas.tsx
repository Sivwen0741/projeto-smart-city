import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alerta, alertasApi, limite, lugar, medida } from '../alertas/modelo';
import { tempoDesde } from '../dispositivos/modelo';
import { ABRIR_OCORRENCIA, RECONHECER } from '../paginas/Alertas';
import { Botao } from './Botao';
import estilos from './FilaAlertas.module.css';
import { Previsto, textoPrevisao } from './Previsto';

const ATUALIZACAO_MS = 15_000;

export function FilaAlertas() {
  const [alertas, setAlertas] = useState<Alerta[] | null>(null);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    let ativo = true;
    const carregar = () =>
      alertasApi
        .listar('ativos')
        .then((lista) => ativo && setAlertas(lista))
        .catch(() => undefined);
    carregar();
    const intervalo = setInterval(() => {
      carregar();
      setAgora(Date.now());
    }, ATUALIZACAO_MS);
    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, []);

  const graves = alertas?.filter((a) => a.criticidade === 'grave').length ?? 0;

  return (
    <section className={estilos.fila} aria-label="Alertas ativos">
      <header className={estilos.cabecalho}>
        <h2>Alertas ativos</h2>
        {alertas && (
          <span className={estilos.contagem}>
            {alertas.length} · {graves} {graves === 1 ? 'grave' : 'graves'}
          </span>
        )}
        <Link className={estilos.todos} to="/alertas">
          Ver todos
        </Link>
      </header>
      <ul className={estilos.itens}>
        {alertas?.map((a) => (
          <li key={a.id} className={`${estilos.item} ${estilos[a.criticidade]}`}>
            <div className={estilos.linha}>
              <span className={estilos.nome}>{a.regra}</span>
              <span className={estilos.quando}>{tempoDesde(a.dataHora, agora)}</span>
            </div>
            <div className={estilos.lugar}>{lugar(a) || a.dispositivo}</div>
            <div className={estilos.linha}>
              <span className={`${estilos.medicao} numero`}>
                {medida(a.valorObservado, a.unidade)} <span>limite {limite(a)}</span>
              </span>
              {a.situacao === 'aberto' ? (
                <Botao variante="primario" disabled title={`Previsto: ${textoPrevisao(RECONHECER)}`}>
                  Reconhecer&nbsp;<Previsto previsao={RECONHECER} />
                </Botao>
              ) : (
                <Botao disabled title={`Previsto: ${textoPrevisao(ABRIR_OCORRENCIA)}`}>
                  Abrir&nbsp;<Previsto previsao={ABRIR_OCORRENCIA} />
                </Botao>
              )}
            </div>
          </li>
        ))}
        {alertas?.length === 0 && <li className={estilos.vazio}>Nenhum alerta ativo.</li>}
      </ul>
    </section>
  );
}

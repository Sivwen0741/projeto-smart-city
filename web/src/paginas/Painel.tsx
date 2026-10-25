import { Link } from 'react-router-dom';
import { FilaAlertas } from '../componentes/FilaAlertas';
import { MapaCidade } from '../componentes/MapaCidade';
import { Previsao, Previsto, textoPrevisao } from '../componentes/Previsto';
import estilos from './Painel.module.css';

const INDICADORES: Previsao = { historia: 'US12', sprint: 'sprint 6' };

// indicadores de 02-painel.svg
const SERVICOS = ['Nível dos rios', 'Fluxo de veículos', 'Qualidade do ar', 'Iluminação pública', 'Ruído urbano', 'Vagas públicas'];

export function Painel() {
  return (
    <div className={estilos.painel}>
      <ul className={estilos.faixa} aria-label="Indicadores da cidade" title={`Previsto: ${textoPrevisao(INDICADORES)}`}>
        {SERVICOS.map((s) =>
          // a tela de rios (us09) abre pelo indicador, sem aba nova no menu
          s === 'Nível dos rios' ? (
            <li key={s} className={estilos.servico}>
              <Link className={estilos.abrirRios} to="/rios" title="Abrir a tela de rios">
                <span className={estilos.nome}>{s}</span>
                <span className={estilos.valor}>–</span>
                <Previsto previsao={INDICADORES} />
              </Link>
            </li>
          ) : (
            <li key={s} className={estilos.servico} aria-disabled="true">
              <span className={estilos.nome}>{s}</span>
              <span className={estilos.valor}>–</span>
              <Previsto previsao={INDICADORES} />
            </li>
          ),
        )}
      </ul>

      <div className={estilos.mapa}>
        <MapaCidade />
      </div>

      <div className={estilos.tira} title={`Previsto: ${textoPrevisao(INDICADORES)}`}>
        {['Ocorrências abertas hoje', 'Ocorrências por bairro'].map((g) => (
          <section key={g} className={estilos.grafico} aria-disabled="true">
            <h2>{g}</h2>
            <Previsto previsao={INDICADORES} />
          </section>
        ))}
      </div>

      <div className={estilos.fila}>
        <FilaAlertas />
      </div>
    </div>
  );
}

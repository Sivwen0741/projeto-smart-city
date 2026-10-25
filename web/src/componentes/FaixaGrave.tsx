import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alerta, lugar, medida } from '../alertas/modelo';
import { tempoDesde } from '../dispositivos/modelo';
import estilos from './FaixaGrave.module.css';

interface Props {
  quantidade: number;
  maisAntigo: Alerta;
}

// us28: sem botão de fechar; some só quando não houver grave sem reconhecimento
export function FaixaGrave({ quantidade, maisAntigo }: Props) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const relogio = setInterval(() => setAgora(Date.now()), 15_000);
    return () => clearInterval(relogio);
  }, []);

  const detalhe = [maisAntigo.regra, maisAntigo.dispositivo, maisAntigo.bairro ?? lugar(maisAntigo), medida(maisAntigo.valorObservado, maisAntigo.unidade)]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={estilos.faixa} role="alert">
      <span className={`${estilos.quantidade} numero`}>{quantidade}</span>
      <span className={estilos.titulo}>{quantidade === 1 ? 'alerta grave sem reconhecimento' : 'alertas graves sem reconhecimento'}</span>
      <span className={estilos.separador} aria-hidden="true" />
      <span className={estilos.detalhe}>
        {quantidade === 1 ? '' : 'mais antigo '}
        {tempoDesde(maisAntigo.dataHora, agora)} · {detalhe}
      </span>
      <Link className={estilos.ver} to={`/alertas?alerta=${maisAntigo.id}`}>
        Ver alerta
      </Link>
    </div>
  );
}

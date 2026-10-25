import { Navigate, Route, Routes } from 'react-router-dom';
import { Moldura } from './componentes/Moldura';
import { Alertas } from './paginas/Alertas';
import { Dispositivos } from './paginas/Dispositivos';
import { Login } from './paginas/Login';
import { Mapa } from './paginas/Mapa';
import { Painel } from './paginas/Painel';
import { Regras } from './paginas/Regras';
import { useSessao } from './sessao/sessao';
import { ProvedorRegistroOcorrencia } from './ocorrencias/registro';
import { ProvedorTempoReal } from './tempo-real/tempoReal';

function Protegida() {
  const { usuario } = useSessao();
  return usuario ? (
    <ProvedorTempoReal>
      <ProvedorRegistroOcorrencia>
        <Moldura />
      </ProvedorRegistroOcorrencia>
    </ProvedorTempoReal>
  ) : (
    <Navigate to="/entrar" replace />
  );
}

export function Rotas() {
  return (
    <Routes>
      <Route path="/entrar" element={<Login />} />
      <Route element={<Protegida />}>
        <Route index element={<Navigate to="/painel" replace />} />
        <Route path="painel" element={<Painel />} />
        <Route path="mapa" element={<Mapa />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="dispositivos" element={<Dispositivos />} />
        <Route path="regras" element={<Regras />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

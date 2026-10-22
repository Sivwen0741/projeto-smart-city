import { Navigate, Route, Routes } from 'react-router-dom';
import { Moldura } from './componentes/Moldura';
import { Dispositivos } from './paginas/Dispositivos';
import { Login } from './paginas/Login';
import { Regras } from './paginas/Regras';
import { useSessao } from './sessao/sessao';

function Protegida() {
  const { usuario } = useSessao();
  return usuario ? <Moldura /> : <Navigate to="/entrar" replace />;
}

export function Rotas() {
  return (
    <Routes>
      <Route path="/entrar" element={<Login />} />
      <Route element={<Protegida />}>
        <Route index element={<Navigate to="/dispositivos" replace />} />
        <Route path="dispositivos" element={<Dispositivos />} />
        <Route path="regras" element={<Regras />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { Navigate, Route, Routes } from 'react-router-dom';
import { Moldura } from './componentes/Moldura';
import { Login } from './paginas/Login';
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
        <Route index element={null} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

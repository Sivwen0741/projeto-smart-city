import { useEffect, useState } from 'react';

// Página provisória do TT01: confirma que a interface web alcança a API. A tela de login (US20) a substitui.
export function App() {
  const [situacao, setSituacao] = useState('verificando');

  useEffect(() => {
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((corpo) => setSituacao(`API ${corpo.situacao}, PostGIS ${corpo.postgis}`))
      .catch(() => setSituacao('API indisponível'));
  }, []);

  return (
    <main>
      <h1>Centro Integrado de Operações Urbanas</h1>
      <p>{situacao}</p>
    </main>
  );
}

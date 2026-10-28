import { useNavigate } from 'react-router-dom';
import type { Alerta } from '../alertas/modelo';
import { useRegistroOcorrencia } from '../ocorrencias/registro';
import { Botao } from './Botao';
import { useSessao } from '../sessao/sessao';
import { SEM_PERMISSAO } from './Moldura';

// alerta já vinculado abre a ocorrência; sem vínculo, abre o registro da us05 com o alerta
export function AbrirOcorrencia({ alerta }: { alerta: Alerta }) {
  const navegar = useNavigate();
  const registro = useRegistroOcorrencia();
  const { pode } = useSessao();
  const bloqueado = !alerta.ocorrenciaId && !pode('operar');
  return (
    <Botao
      disabled={bloqueado}
      title={bloqueado ? SEM_PERMISSAO : alerta.ocorrenciaId ? 'Abrir a ocorrência vinculada' : 'Registrar uma ocorrência a partir deste alerta'}
      onClick={(e) => {
        e.stopPropagation();
        if (alerta.ocorrenciaId) navegar(`/ocorrencias/${alerta.ocorrenciaId}`);
        else registro.abrir(alerta);
      }}
    >
      Abrir
    </Botao>
  );
}

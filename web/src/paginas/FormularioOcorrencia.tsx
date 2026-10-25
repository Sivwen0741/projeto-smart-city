import { FormEvent, useEffect, useId, useState } from 'react';
import { GRAVIDADES, medida } from '../alertas/modelo';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import { MapaPonto } from '../componentes/MapaPonto';
import { Segmentado } from '../componentes/Segmentado';
import { Selecao } from '../componentes/Selecao';
import { Criticidade, dispositivosApi, Local } from '../dispositivos/modelo';
import { Ocorrencia, ocorrenciasApi, Orgao } from '../ocorrencias/modelo';
import { useRegistroOcorrencia } from '../ocorrencias/registro';
import { ErroApi } from '../sessao/api';
import estilos from './FormularioOcorrencia.module.css';

const CRITICIDADES: { valor: Criticidade; rotulo: string }[] = (['grave', 'atencao', 'informativo'] as const).map((valor) => ({
  valor,
  rotulo: GRAVIDADES[valor],
}));

type Localizacao = { situacao: 'vazia' } | { situacao: 'buscando' } | { situacao: 'ok'; local: Local } | { situacao: 'erro'; mensagem: string };

export function FormularioOcorrencia() {
  const { alerta, fechar } = useRegistroOcorrencia();
  const idDescricao = useId();
  const [categorias, setCategorias] = useState<string[]>([]);
  const [orgaos, setOrgaos] = useState<Orgao[]>([]);
  const [categoria, setCategoria] = useState('');
  const [criticidade, setCriticidade] = useState<Criticidade | null>(alerta?.criticidade ?? null);
  const [orgaoId, setOrgaoId] = useState('');
  const [descricao, setDescricao] = useState(
    alerta ? `${alerta.regra}: ${alerta.dispositivo} registrou ${medida(alerta.valorObservado, alerta.unidade)}.` : '',
  );
  const [ponto, setPonto] = useState<{ latitude: number; longitude: number } | null>(
    alerta ? { latitude: alerta.latitude, longitude: alerta.longitude } : null,
  );
  const [endereco, setEndereco] = useState(alerta?.endereco ?? '');
  const [localizacao, setLocalizacao] = useState<Localizacao>({ situacao: 'vazia' });
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [registrada, setRegistrada] = useState<Ocorrencia | null>(null);

  useEffect(() => {
    Promise.all([ocorrenciasApi.categorias(), ocorrenciasApi.orgaos()])
      .then(([c, o]) => {
        setCategorias(c);
        setOrgaos(o);
      })
      .catch(() => setErro('Não foi possível carregar as categorias e os órgãos.'));
  }, []);

  useEffect(() => {
    if (!ponto) return setLocalizacao({ situacao: 'vazia' });
    let cancelado = false;
    setLocalizacao({ situacao: 'buscando' });
    dispositivosApi
      .localizar(ponto.latitude, ponto.longitude)
      .then((local) => !cancelado && setLocalizacao({ situacao: 'ok', local }))
      .catch((e) => !cancelado && setLocalizacao({ situacao: 'erro', mensagem: e instanceof ErroApi ? e.message : 'Não foi possível localizar o ponto.' }));
    return () => {
      cancelado = true;
    };
  }, [ponto?.latitude, ponto?.longitude]);

  const erros = {
    categoria: !categoria ? 'Escolha a categoria.' : undefined,
    criticidade: !criticidade ? 'Escolha a gravidade.' : undefined,
    localizacao: !ponto ? 'Marque a localização no mapa.' : localizacao.situacao === 'erro' ? localizacao.mensagem : undefined,
  };
  const valido = !erros.categoria && !erros.criticidade && !erros.localizacao;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setTentou(true);
    if (!valido || !ponto || !criticidade) return;
    setEnviando(true);
    setErro(null);
    try {
      setRegistrada(
        await ocorrenciasApi.registrar({
          categoria,
          criticidade,
          orgaoId: orgaoId || null,
          descricao,
          endereco,
          ...ponto,
          ...(alerta ? { alertaId: alerta.id } : {}),
        }),
      );
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível registrar a ocorrência. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  if (registrada) {
    return (
      <aside className={estilos.painel} aria-label="Ocorrência registrada">
        <header className={estilos.cabecalho}>
          <h2>Ocorrência registrada</h2>
          <Botao variante="link" onClick={fechar}>
            Fechar
          </Botao>
        </header>
        <div className={estilos.corpo}>
          <p className={estilos.protocolo} role="status">
            Protocolo <strong className="numero">{registrada.protocolo}</strong>
          </p>
          <dl className={estilos.ficha}>
            <dt>Categoria</dt>
            <dd>{registrada.categoria}</dd>
            <dt>Gravidade</dt>
            <dd>{GRAVIDADES[registrada.criticidade]}</dd>
            <dt>Órgão</dt>
            <dd>{registrada.orgao ?? '–'}</dd>
            <dt>Local</dt>
            <dd>{[registrada.endereco, registrada.bairro].filter(Boolean).join(' · ') || '–'}</dd>
            <dt>Origem</dt>
            <dd>{registrada.origem === 'alerta' ? `Alerta de ${alerta?.dispositivo ?? 'dispositivo'}` : 'Telefone'}</dd>
          </dl>
        </div>
      </aside>
    );
  }

  return (
    <aside className={estilos.painel} aria-label="Registrar ocorrência">
      <header className={estilos.cabecalho}>
        <h2>Registrar ocorrência</h2>
        <Botao variante="link" onClick={fechar}>
          Fechar
        </Botao>
      </header>
      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <div className={estilos.corpo}>
          {alerta && (
            <p className={estilos.nota}>
              A partir do alerta <strong>{alerta.regra}</strong> · {alerta.dispositivo}. O alerta fica vinculado à ocorrência.
            </p>
          )}
          <Selecao
            rotulo="Categoria"
            vazio="Escolha"
            opcoes={categorias.map((c) => ({ valor: c, rotulo: c }))}
            value={categoria}
            erro={tentou ? erros.categoria : undefined}
            onChange={(e) => setCategoria(e.target.value)}
          />
          <Segmentado
            rotulo="Gravidade"
            opcoes={CRITICIDADES.map((c) => ({ ...c, classe: `${estilos.gravidade} ${estilos[c.valor]}` }))}
            valor={criticidade}
            aoMudar={setCriticidade}
            erro={tentou ? erros.criticidade : undefined}
          />
          <Selecao
            rotulo="Órgão responsável"
            vazio="A definir"
            opcoes={orgaos.map((o) => ({ valor: o.id, rotulo: o.nome }))}
            value={orgaoId}
            onChange={(e) => setOrgaoId(e.target.value)}
          />
          <div className={estilos.campo}>
            <label className={estilos.rotulo} htmlFor={idDescricao}>
              Descrição <span className={estilos.dica}>· o que o cidadão informou</span>
            </label>
            <textarea id={idDescricao} className={estilos.area} maxLength={2000} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className={estilos.localizacao}>
            <span className={estilos.rotulo}>
              Localização <span className={estilos.dica}>· clique no mapa</span>
            </span>
            <MapaPonto ponto={ponto} rotulo="Mapa para marcar a localização da ocorrência" aoEscolher={(latitude, longitude) => setPonto({ latitude, longitude })} />
            <div className={estilos.bairro} aria-live="polite">
              <span>Bairro</span>
              <strong>
                {localizacao.situacao === 'ok' && (localizacao.local.bairro ?? `sem bairro · zona rural, distrito ${localizacao.local.distrito}`)}
                {localizacao.situacao === 'buscando' && <span className={estilos.distrito}>consultando…</span>}
                {(localizacao.situacao === 'vazia' || localizacao.situacao === 'erro') && <span className={estilos.distrito}>–</span>}
              </strong>
            </div>
            {(tentou || localizacao.situacao === 'erro') && erros.localizacao && (
              <span className={estilos.erro} role="alert">
                {erros.localizacao}
              </span>
            )}
          </div>
          <Campo rotulo="Endereço" maxLength={255} value={endereco} onChange={(e) => setEndereco(e.target.value)} />
          {erro && (
            <p className={estilos.erro} role="alert">
              {erro}
            </p>
          )}
        </div>
        <footer className={estilos.rodape}>
          <Botao onClick={fechar}>Cancelar</Botao>
          <Botao type="submit" variante="primario" disabled={enviando}>
            {enviando ? 'Registrando…' : 'Registrar ocorrência'}
          </Botao>
        </footer>
      </form>
    </aside>
  );
}

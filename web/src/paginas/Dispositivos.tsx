import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Aviso } from '../componentes/Aviso';
import { Botao } from '../componentes/Botao';
import { Barrinha } from '../componentes/Barrinha';
import { useSessao } from '../sessao/sessao';
import { SEM_PERMISSAO } from '../componentes/Moldura';
import { Previsao, Previsto, textoPrevisao } from '../componentes/Previsto';
import { Simulado } from '../componentes/Simulado';
import {
  Dispositivo,
  dispositivosApi,
  Grandeza,
  Ordenacao,
  SITUACOES,
  tempoDesde,
  TipoDispositivo,
} from '../dispositivos/modelo';
import { medida } from '../alertas/modelo';
import { ErroApi } from '../sessao/api';
import estilos from './Dispositivos.module.css';
import { FormularioDispositivo } from './FormularioDispositivo';

const BUSCA: Previsao = { historia: 'US08', sprint: 'backlog' };
const FILTROS: Previsao = { historia: 'US08', sprint: 'backlog' };
const EXPORTAR: Previsao = { historia: 'US25', sprint: 'backlog' };

// mesma cadência de atualização do guia de identidade
const ATUALIZACAO_MS = 30_000;

const COLUNAS: { campo: Ordenacao; rotulo: string }[] = [
  { campo: 'codigo', rotulo: 'Código' },
  { campo: 'tipo', rotulo: 'Tipo' },
  { campo: 'localizacao', rotulo: 'Localização' },
  { campo: 'situacao', rotulo: 'Situação' },
];

type Painel = { modo: 'fechado' } | { modo: 'novo' } | { modo: 'edicao'; dispositivo: Dispositivo };

function Seta({ direcao }: { direcao: 'asc' | 'desc' }) {
  return (
    <svg className={estilos.seta} width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
      <path d={direcao === 'asc' ? 'M1 6 L4.5 2.5 L8 6' : 'M1 3 L4.5 6.5 L8 3'} />
    </svg>
  );
}

export function Dispositivos() {
  const [dispositivos, setDispositivos] = useState<Dispositivo[] | null>(null);
  const [tipos, setTipos] = useState<TipoDispositivo[]>([]);
  const [grandezas, setGrandezas] = useState<Grandeza[]>([]);
  const [ordem, setOrdem] = useState<Ordenacao>('codigo');
  const [direcao, setDirecao] = useState<'asc' | 'desc'>('asc');
  const [painel, setPainel] = useState<Painel>({ modo: 'fechado' });
  const [erro, setErro] = useState<string | null>(null);
  const [agora, setAgora] = useState(() => Date.now());
  const [parametros, setParametros] = useSearchParams();
  const pedido = parametros.get('id');
  const { pode } = useSessao();

  const carregar = useCallback(async () => {
    try {
      setDispositivos(await dispositivosApi.listar(ordem, direcao));
      setAgora(Date.now());
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível carregar os dispositivos.');
    }
  }, [ordem, direcao]);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, [carregar]);

  useEffect(() => {
    Promise.all([dispositivosApi.tipos(), dispositivosApi.grandezas()])
      .then(([t, g]) => {
        setTipos(t);
        setGrandezas(g);
      })
      .catch(() => setErro('Não foi possível carregar os tipos de dispositivo.'));
  }, []);

  // a busca do cabeçalho abre o dispositivo por /dispositivos?id=
  useEffect(() => {
    if (!pedido || !dispositivos) return;
    const encontrado = dispositivos.find((d) => d.id === pedido);
    if (encontrado) setPainel({ modo: 'edicao', dispositivo: encontrado });
    setParametros({}, { replace: true });
  }, [pedido, dispositivos, setParametros]);

  function ordenar(campo: Ordenacao) {
    if (campo === ordem) setDirecao(direcao === 'asc' ? 'desc' : 'asc');
    else {
      setOrdem(campo);
      setDirecao('asc');
    }
  }

  function cabecalho(campo: Ordenacao, rotulo: string) {
    const ativa = ordem === campo;
    return (
      <th aria-sort={ativa ? (direcao === 'asc' ? 'ascending' : 'descending') : undefined}>
        <button type="button" className={estilos.ordenar} onClick={() => ordenar(campo)}>
          {rotulo}
          {ativa && <Seta direcao={direcao} />}
        </button>
      </th>
    );
  }

  async function salvo(dispositivo: Dispositivo) {
    setPainel({ modo: 'edicao', dispositivo });
    await carregar();
  }

  const total = dispositivos?.length ?? 0;
  const semComunicacao = dispositivos?.filter((d) => d.situacao === 'sem_comunicacao').length ?? 0;
  const selecionado = painel.modo === 'edicao' ? painel.dispositivo.id : null;

  return (
    <div className={estilos.pagina}>
      <section className={estilos.principal}>
        <div className={estilos.titulo}>
          <h1>Dispositivos</h1>
          {dispositivos && (
            <span className={estilos.resumo}>
              {total} {total === 1 ? 'cadastrado' : 'cadastrados'}, {semComunicacao} sem comunicação
            </span>
          )}
        </div>

        <div className={estilos.ferramentas}>
          <span className={estilos.previsto} aria-disabled="true" title={`Previsto: ${textoPrevisao(BUSCA)}`}>
            Buscar dispositivo <Previsto previsao={BUSCA} />
          </span>
          {['Tipo', 'Situação', 'Bairro'].map((filtro) => (
            <span key={filtro} className={estilos.filtro} aria-disabled="true" title={`Previsto: ${textoPrevisao(FILTROS)}`}>
              {filtro}
            </span>
          ))}
          <Previsto previsao={FILTROS} />
          <span className={`${estilos.filtro} ${estilos.exportar}`} aria-disabled="true" title={`Previsto: ${textoPrevisao(EXPORTAR)}`}>
            Exportar <Previsto previsao={EXPORTAR} />
          </span>
          <Botao variante="primario" disabled={!pode('configurar')} title={pode('configurar') ? undefined : SEM_PERMISSAO} onClick={() => setPainel({ modo: 'novo' })}>
            Cadastrar dispositivo
          </Botao>
        </div>

        {erro && <Aviso>{erro}</Aviso>}

        <div className={estilos.tabela}>
          <table>
            <thead>
              <tr>
                {COLUNAS.map((c) => cabecalho(c.campo, c.rotulo))}
                <th>
                  Última leitura
                </th>
                <th className={estilos.estreita}>
                  Últimas 3 h
                </th>
                {cabecalho('comunicacao', 'Comunicação')}
              </tr>
            </thead>
            <tbody>
              {dispositivos?.map((d) => (
                <tr
                  key={d.id}
                  className={[d.id === selecionado && estilos.selecionada, d.situacao === 'inativo' && estilos.inativa].filter(Boolean).join(' ')}
                  onClick={() => setPainel({ modo: 'edicao', dispositivo: d })}
                >
                  <td className={estilos.codigo}>
                    <button type="button" className={estilos.abrir} onClick={() => setPainel({ modo: 'edicao', dispositivo: d })}>
                      {d.identificador}
                    </button>
                    {d.simulado && <Simulado />}
                  </td>
                  <td>{d.tipo}</td>
                  <td>
                    <div>{d.bairro ?? (d.distrito ? `Zona rural, ${d.distrito}` : '–')}</div>
                    {d.endereco && <div className={estilos.apoio}>{d.endereco}</div>}
                  </td>
                  <td>
                    <span className={`${estilos.situacao} ${estilos[d.situacao]}`}>{SITUACOES[d.situacao]}</span>
                  </td>
                  <td className={d.ultimaLeitura ? 'numero' : estilos.vazia}>
                    {d.ultimaLeitura ? medida(d.ultimaLeitura.valor, d.ultimaLeitura.unidade) : '–'}
                  </td>
                  <td>
                    {d.ultimas3h?.some((v) => v !== null) ? (
                      <Barrinha serie={d.ultimas3h} rotulo={`${d.identificador}: médias de 20 min das últimas 3 h`} />
                    ) : (
                      <span className={estilos.vazia}>–</span>
                    )}
                  </td>
                  <td className="numero" title={d.ultimaComunicacao ? new Date(d.ultimaComunicacao).toLocaleString('pt-BR') : undefined}>
                    {tempoDesde(d.ultimaComunicacao, agora)}
                  </td>
                </tr>
              ))}
              {dispositivos?.length === 0 && (
                <tr>
                  <td colSpan={7} className={estilos.semDados}>
                    Nenhum dispositivo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {painel.modo !== 'fechado' && (
        <FormularioDispositivo
          key={painel.modo === 'edicao' ? painel.dispositivo.id : 'novo'}
          dispositivo={painel.modo === 'edicao' ? painel.dispositivo : null}
          tipos={tipos}
          grandezas={grandezas}
          aoSalvar={salvo}
          aoFechar={() => setPainel({ modo: 'fechado' })}
        />
      )}
    </div>
  );
}

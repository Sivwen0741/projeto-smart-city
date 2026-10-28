import { useCallback, useEffect, useState } from 'react';
import { Aviso } from '../componentes/Aviso';
import { Botao } from '../componentes/Botao';
import { dispositivosApi, Grandeza } from '../dispositivos/modelo';
import { condicao, condicaoComplementar, CRITICIDADES, RegraAlerta, regrasApi } from '../regras/modelo';
import { ErroApi } from '../sessao/api';
import estilos from './Dispositivos.module.css';
import { FormularioRegra } from './FormularioRegra';
import proprios from './Regras.module.css';

const TITULO_SISTEMA = 'Regra do sistema (US07): usa o limite de comunicação de cada dispositivo e não pode ser editada nem desativada';

type Painel = { modo: 'fechado' } | { modo: 'nova' } | { modo: 'edicao'; regra: RegraAlerta };

export function Regras() {
  const [regras, setRegras] = useState<RegraAlerta[] | null>(null);
  const [grandezas, setGrandezas] = useState<Grandeza[]>([]);
  const [painel, setPainel] = useState<Painel>({ modo: 'fechado' });
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setRegras(await regrasApi.listar());
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível carregar as regras.');
    }
  }, []);

  useEffect(() => {
    carregar();
    dispositivosApi.grandezas().then(setGrandezas).catch(() => setErro('Não foi possível carregar as grandezas.'));
  }, [carregar]);

  async function salva(regra: RegraAlerta) {
    setPainel({ modo: 'edicao', regra });
    await carregar();
  }

  const ativas = regras?.filter((r) => r.ativa).length ?? 0;
  const selecionada = painel.modo === 'edicao' ? painel.regra.id : null;
  const rotuloGrandeza = (codigo: string) => grandezas.find((g) => g.codigo === codigo)?.rotulo ?? codigo;

  return (
    <div className={estilos.pagina}>
      <section className={estilos.principal}>
        <div className={estilos.titulo}>
          <h1>Regras de alerta</h1>
          {regras && (
            <span className={estilos.resumo}>
              {regras.length} {regras.length === 1 ? 'regra' : 'regras'}, {ativas} {ativas === 1 ? 'ativa' : 'ativas'} · valem para
              todos os dispositivos que medem a grandeza
            </span>
          )}
        </div>

        <div className={estilos.ferramentas}>
          <Botao variante="primario" className={proprios.cadastrar} onClick={() => setPainel({ modo: 'nova' })}>
            Cadastrar regra
          </Botao>
        </div>

        {erro && <Aviso>{erro}</Aviso>}

        <div className={estilos.tabela}>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Grandeza</th>
                <th>Condição</th>
                <th>Duração mínima</th>
                <th>Gravidade</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {regras?.map((r) =>
                r.sistema ? (
                  <tr key={r.id} className={proprios.sistema} aria-disabled="true" title={TITULO_SISTEMA}>
                    <td className={proprios.nome}>
                      {r.nome} <span className={proprios.marca}>regra do sistema</span>
                    </td>
                    <td>Tempo sem comunicação</td>
                    <td>limite de cada dispositivo</td>
                    <td className="numero">–</td>
                    <td>
                      <span className={`${estilos.situacao} ${proprios[r.criticidade]}`}>
                        {CRITICIDADES.find((c) => c.valor === r.criticidade)?.rotulo}
                      </span>
                    </td>
                    <td className="numero">{r.ativa ? 'Ativa' : 'Desativada'}</td>
                  </tr>
                ) : (
                <tr
                  key={r.id}
                  className={[r.id === selecionada && estilos.selecionada, !r.ativa && estilos.inativa].filter(Boolean).join(' ')}
                  onClick={() => setPainel({ modo: 'edicao', regra: r })}
                >
                  <td className={proprios.nome}>
                    <button type="button" className={estilos.abrir} onClick={() => setPainel({ modo: 'edicao', regra: r })}>
                      {r.nome}
                    </button>
                  </td>
                  <td>{rotuloGrandeza(r.tipoGrandeza)}</td>
                  <td className={proprios.condicao}>
                    {condicao(r, grandezas)}
                    {r.tipo === 'risco_enchente' && <div className={proprios.complemento}>{condicaoComplementar(r)}</div>}
                  </td>
                  <td className="numero">{r.duracaoMinutos} min</td>
                  <td>
                    <span className={`${estilos.situacao} ${proprios[r.criticidade]}`}>
                      {CRITICIDADES.find((c) => c.valor === r.criticidade)?.rotulo}
                    </span>
                  </td>
                  <td className="numero">{r.ativa ? 'Ativa' : 'Desativada'}</td>
                </tr>
                ),
              )}
              {regras?.length === 0 && (
                <tr>
                  <td colSpan={6} className={estilos.semDados}>
                    Nenhuma regra cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {painel.modo !== 'fechado' && (
        <FormularioRegra
          key={painel.modo === 'edicao' ? `${painel.regra.id}-${JSON.stringify(painel.regra)}` : 'nova'}
          regra={painel.modo === 'edicao' ? painel.regra : null}
          grandezas={grandezas}
          aoSalvar={salva}
          aoFechar={() => setPainel({ modo: 'fechado' })}
        />
      )}
    </div>
  );
}

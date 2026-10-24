import { FormEvent, useEffect, useState } from 'react';
import { Aviso } from '../componentes/Aviso';
import { Botao } from '../componentes/Botao';
import { CaixaSelecao } from '../componentes/CaixaSelecao';
import { Campo } from '../componentes/Campo';
import { Segmentado } from '../componentes/Segmentado';
import { Selecao } from '../componentes/Selecao';
import { Grandeza } from '../dispositivos/modelo';
import {
  Alteracao,
  Criticidade,
  CRITICIDADES,
  DadosRegra,
  descreverAlteracao,
  formatarNumero,
  Operador,
  OPERADORES,
  RegraAlerta,
  regrasApi,
} from '../regras/modelo';
import { ErroApi } from '../sessao/api';
import estilos from './FormularioRegra.module.css';

interface Formulario {
  nome: string;
  tipoGrandeza: string;
  operador: Operador | null;
  valorLimite: string;
  duracaoMinutos: string;
  criticidade: Criticidade | null;
  ativa: boolean;
}

type NomeCampo = keyof Formulario;

const ROTULOS: Record<NomeCampo, string> = {
  nome: 'nome',
  tipoGrandeza: 'grandeza',
  operador: 'operador',
  valorLimite: 'valor limite',
  duracaoMinutos: 'duração mínima',
  criticidade: 'gravidade',
  ativa: 'situação',
};

interface Props {
  regra: RegraAlerta | null;
  grandezas: Grandeza[];
  aoSalvar: (regra: RegraAlerta) => void;
  aoFechar: () => void;
}

function inicial(r: RegraAlerta | null): Formulario {
  if (!r) return { nome: '', tipoGrandeza: '', operador: null, valorLimite: '', duracaoMinutos: '', criticidade: null, ativa: true };
  return {
    nome: r.nome,
    tipoGrandeza: r.tipoGrandeza,
    operador: r.operador,
    valorLimite: formatarNumero(r.valorLimite).replace(/\./g, ''),
    duracaoMinutos: String(r.duracaoMinutos),
    criticidade: r.criticidade,
    ativa: r.ativa,
  };
}

function numero(texto: string): number | null {
  const limpo = texto.trim().replace(',', '.');
  if (!limpo || !/^-?\d+(\.\d+)?$/.test(limpo)) return null;
  return Number(limpo);
}

function validar(f: Formulario): Partial<Record<NomeCampo, string>> {
  const erros: Partial<Record<NomeCampo, string>> = {};
  if (!f.nome.trim()) erros.nome = 'Informe o nome da regra.';
  if (!f.tipoGrandeza) erros.tipoGrandeza = 'Escolha a grandeza observada.';
  if (!f.operador) erros.operador = 'Escolha o operador de comparação.';
  if (numero(f.valorLimite) === null) erros.valorLimite = f.valorLimite.trim() ? 'Use um número, como 3,5.' : 'Informe o valor limite.';
  const duracao = numero(f.duracaoMinutos);
  if (duracao !== null && duracao < 0) erros.duracaoMinutos = 'Não pode ser negativa. Use 0 para disparar na primeira leitura.';
  else if (duracao === null || !Number.isInteger(duracao)) erros.duracaoMinutos = 'Informe a duração em minutos inteiros.';
  if (!f.criticidade) erros.criticidade = 'Escolha a gravidade.';
  return erros;
}

export function FormularioRegra({ regra, grandezas, aoSalvar, aoFechar }: Props) {
  const [f, setF] = useState<Formulario>(() => inicial(regra));
  const [tocados, setTocados] = useState<Partial<Record<NomeCampo, boolean>>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [alteracoes, setAlteracoes] = useState<Alteracao[]>([]);

  const editando = regra !== null;
  const erros = validar(f);
  const valido = Object.keys(erros).length === 0;
  const unidade = grandezas.find((g) => g.codigo === f.tipoGrandeza)?.unidade;
  const limiteMudou = editando && numero(f.valorLimite) !== null && numero(f.valorLimite) !== regra.valorLimite;

  useEffect(() => {
    if (!regra) return;
    regrasApi.alteracoes(regra.id).then(setAlteracoes).catch(() => setAlteracoes([]));
  }, [regra]);

  function alterar<K extends NomeCampo>(campo: K, valor: Formulario[K]) {
    setF((atual) => ({ ...atual, [campo]: valor }));
    setTocados((atual) => ({ ...atual, [campo]: true }));
  }

  const erro = (campo: NomeCampo) => (tocados[campo] ? erros[campo] : undefined);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!valido) {
      setTocados({ nome: true, tipoGrandeza: true, operador: true, valorLimite: true, duracaoMinutos: true, criticidade: true });
      return;
    }
    const dados: DadosRegra = {
      nome: f.nome.trim(),
      tipoGrandeza: f.tipoGrandeza,
      operador: f.operador!,
      valorLimite: numero(f.valorLimite)!,
      duracaoMinutos: numero(f.duracaoMinutos)!,
      criticidade: f.criticidade!,
      ativa: f.ativa,
    };
    setEnviando(true);
    setErroGeral(null);
    try {
      aoSalvar(editando ? await regrasApi.atualizar(regra.id, dados) : await regrasApi.criar(dados));
    } catch (e) {
      setErroGeral(e instanceof ErroApi ? e.message : 'Não foi possível falar com o servidor. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <aside className={estilos.painel} aria-label={editando ? 'Editar regra' : 'Nova regra'}>
      <header className={estilos.cabecalho}>
        <h2>{editando ? 'Editar regra' : 'Nova regra'}</h2>
        <Botao variante="link" onClick={aoFechar}>
          Fechar
        </Botao>
      </header>

      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <div className={estilos.corpo}>
          <Campo rotulo="Nome" maxLength={120} erro={erro('nome')} value={f.nome} onChange={(e) => alterar('nome', e.target.value)} />

          <Selecao
            rotulo="Grandeza observada"
            vazio="Escolha a grandeza"
            erro={erro('tipoGrandeza')}
            opcoes={grandezas.map((g) => ({ valor: g.codigo, rotulo: `${g.rotulo}, em ${g.unidade}` }))}
            value={f.tipoGrandeza}
            onChange={(e) => alterar('tipoGrandeza', e.target.value)}
          />

          <Segmentado
            rotulo="Dispara quando a leitura for"
            opcoes={OPERADORES.map((o) => ({ ...o, classe: estilos.operador }))}
            valor={f.operador}
            erro={erro('operador')}
            aoMudar={(operador) => alterar('operador', operador)}
          />

          <div className={estilos.par}>
            <div className={estilos.coluna}>
              <Campo
                rotulo="Valor limite"
                className="numero"
                inputMode="decimal"
                unidade={unidade}
                erro={erro('valorLimite')}
                value={f.valorLimite}
                onChange={(e) => alterar('valorLimite', e.target.value)}
              />
              {limiteMudou && !erro('valorLimite') && (
                <span className={estilos.antes}>
                  salvo: {formatarNumero(regra.valorLimite)} {unidade}
                </span>
              )}
            </div>
            <Campo
              rotulo="Duração mínima"
              className="numero"
              inputMode="numeric"
              unidade="min"
              erro={erro('duracaoMinutos')}
              value={f.duracaoMinutos}
              onChange={(e) => alterar('duracaoMinutos', e.target.value)}
            />
          </div>

          <Segmentado
            rotulo="Gravidade"
            opcoes={CRITICIDADES.map((c) => ({ ...c, classe: `${estilos.gravidade} ${estilos[c.valor]}` }))}
            valor={f.criticidade}
            erro={erro('criticidade')}
            aoMudar={(criticidade) => alterar('criticidade', criticidade)}
          />

          <div className={estilos.ativa}>
            <CaixaSelecao rotulo="Regra ativa" checked={f.ativa} onChange={(e) => alterar('ativa', e.target.checked)} />
            <span className={estilos.dica}>· desativar não apaga os alertas já gerados</span>
          </div>

          {editando && (
            <p className={estilos.nota}>
              Os alertas emitidos antes desta alteração continuam mostrando o limite com que foram disparados.
              {regra.alertas > 0 && ` Esta regra já gerou ${regra.alertas} ${regra.alertas === 1 ? 'alerta' : 'alertas'}.`}
            </p>
          )}

          {editando && alteracoes.length > 0 && (
            <section className={estilos.historico} aria-label="Alterações">
              <h3>Alterações</h3>
              <ul>
                {alteracoes.map((a, i) => (
                  <li key={i}>
                    <span>{descreverAlteracao(a, grandezas)}</span>
                    <span className={estilos.quem}>
                      {a.autor ?? 'sistema'} ·{' '}
                      {new Date(a.dataHora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {erroGeral && <Aviso>{erroGeral}</Aviso>}
        </div>

        {!valido && (
          <p className={estilos.pendente} aria-live="polite">
            Para salvar, corrija: {(Object.keys(erros) as NomeCampo[]).map((c) => ROTULOS[c]).join(', ')}.
          </p>
        )}

        <footer className={estilos.rodape}>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" variante="primario" disabled={!valido || enviando}>
            {enviando ? 'Salvando…' : editando ? 'Salvar alteração' : 'Cadastrar regra'}
          </Botao>
        </footer>
      </form>
    </aside>
  );
}

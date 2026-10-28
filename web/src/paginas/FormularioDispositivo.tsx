import { FormEvent, useEffect, useState } from 'react';
import { Aviso } from '../componentes/Aviso';
import { Botao } from '../componentes/Botao';
import { useSessao } from '../sessao/sessao';
import { SEM_PERMISSAO } from '../componentes/Moldura';
import { CaixaSelecao } from '../componentes/CaixaSelecao';
import { Campo } from '../componentes/Campo';
import { MapaPonto } from '../componentes/MapaPonto';
import { Segmentado } from '../componentes/Segmentado';
import { Selecao } from '../componentes/Selecao';
import {
  CampoAtributo,
  DadosDispositivo,
  Dispositivo,
  dispositivosApi,
  Estado,
  ESTADOS,
  Grandeza,
  Local,
  TipoDispositivo,
} from '../dispositivos/modelo';
import { ErroApi } from '../sessao/api';
import estilos from './FormularioDispositivo.module.css';

type ValorAtributo = string | string[];

interface Formulario {
  identificador: string;
  tipoDispositivoId: string;
  descricao: string;
  endereco: string;
  latitude: string;
  longitude: string;
  dataInstalacao: string;
  estado: Estado;
  atributos: Record<string, ValorAtributo>;
}

interface Erros {
  identificador?: string;
  tipo?: string;
  coordenada?: string;
  atributos?: Record<string, string>;
  geral?: string;
}

type Localizacao = { situacao: 'vazia' } | { situacao: 'buscando' } | { situacao: 'ok'; local: Local } | { situacao: 'erro'; mensagem: string };

interface Props {
  dispositivo: Dispositivo | null;
  tipos: TipoDispositivo[];
  grandezas: Grandeza[];
  aoSalvar: (dispositivo: Dispositivo) => void;
  aoFechar: () => void;
}

function inicial(d: Dispositivo | null): Formulario {
  if (!d) {
    return { identificador: '', tipoDispositivoId: '', descricao: '', endereco: '', latitude: '', longitude: '', dataInstalacao: '', estado: 'ativo', atributos: {} };
  }
  const atributos = Object.fromEntries(
    Object.entries(d.atributos).map(([nome, valor]) => [nome, Array.isArray(valor) ? valor.map(String) : String(valor)]),
  );
  return {
    identificador: d.identificador,
    tipoDispositivoId: d.tipoDispositivoId,
    descricao: d.descricao ?? '',
    endereco: d.endereco ?? '',
    latitude: String(d.latitude).replace('.', ','),
    longitude: String(d.longitude).replace('.', ','),
    dataInstalacao: d.dataInstalacao ?? '',
    estado: d.estado,
    atributos,
  };
}

function numero(texto: string): number | null {
  const limpo = texto.trim().replace(',', '.');
  if (!limpo) return null;
  const valor = Number(limpo);
  return Number.isFinite(valor) ? valor : null;
}

function coordenada(f: Formulario): { latitude: number; longitude: number } | null {
  const latitude = numero(f.latitude);
  const longitude = numero(f.longitude);
  if (latitude === null || longitude === null || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

function converterAtributos(campos: CampoAtributo[], valores: Record<string, ValorAtributo>) {
  const atributos: Record<string, unknown> = {};
  const erros: Record<string, string> = {};
  for (const campo of campos) {
    const valor = valores[campo.nome];
    const vazio = valor === undefined || (Array.isArray(valor) ? valor.length === 0 : valor.trim() === '');
    if (vazio) {
      if (campo.obrigatorio) erros[campo.nome] = `Informe ${campo.rotulo.toLowerCase()}.`;
      continue;
    }
    if (campo.tipo === 'inteiro') {
      const n = numero(valor as string);
      const foraDaFaixa = n === null || !Number.isInteger(n) || (campo.minimo !== undefined && n < campo.minimo) || (campo.maximo !== undefined && n > campo.maximo);
      if (foraDaFaixa) erros[campo.nome] = campo.maximo !== undefined ? `Inteiro entre ${campo.minimo} e ${campo.maximo}.` : `Inteiro a partir de ${campo.minimo}.`;
      else atributos[campo.nome] = n;
    } else atributos[campo.nome] = Array.isArray(valor) ? valor : valor.trim();
  }
  return { atributos, erros };
}

export function FormularioDispositivo({ dispositivo, tipos, grandezas, aoSalvar, aoFechar }: Props) {
  const [f, setF] = useState<Formulario>(() => inicial(dispositivo));
  const [erros, setErros] = useState<Erros>({});
  const [localizacao, setLocalizacao] = useState<Localizacao>({ situacao: 'vazia' });
  const [enviando, setEnviando] = useState(false);
  const { pode } = useSessao();

  const tipo = tipos.find((t) => t.id === f.tipoDispositivoId) ?? null;
  const ponto = coordenada(f);
  const editando = dispositivo !== null;

  useEffect(() => {
    if (!ponto) {
      setLocalizacao({ situacao: 'vazia' });
      return;
    }
    let cancelado = false;
    setLocalizacao({ situacao: 'buscando' });
    const espera = setTimeout(() => {
      dispositivosApi
        .localizar(ponto.latitude, ponto.longitude)
        .then((local) => !cancelado && setLocalizacao({ situacao: 'ok', local }))
        .catch((e) => !cancelado && setLocalizacao({ situacao: 'erro', mensagem: e instanceof ErroApi ? e.message : 'Não foi possível localizar o ponto.' }));
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [ponto?.latitude, ponto?.longitude]);

  function alterar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setF((atual) => ({ ...atual, [campo]: valor }));
  }

  function alterarAtributo(campo: CampoAtributo, valor: ValorAtributo) {
    setF((atual) => {
      const atributos = { ...atual.atributos, [campo.nome]: valor };
      const unidadeVazia = !String(atual.atributos.unidadeMedida ?? '').trim();
      if (campo.tipo === 'grandeza' && unidadeVazia && tipo?.campos.some((c) => c.nome === 'unidadeMedida')) {
        atributos.unidadeMedida = grandezas.find((g) => g.codigo === valor)?.unidade ?? '';
      }
      return { ...atual, atributos };
    });
  }

  function trocarTipo(id: string) {
    const novo = tipos.find((t) => t.id === id);
    setF((atual) => ({
      ...atual,
      tipoDispositivoId: id,
      atributos: Object.fromEntries(Object.entries(atual.atributos).filter(([nome]) => novo?.campos.some((c) => c.nome === nome))),
    }));
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const { atributos, erros: errosAtributos } = converterAtributos(tipo?.campos ?? [], f.atributos);
    const novosErros: Erros = {
      identificador: f.identificador.trim() ? undefined : 'Informe o código identificador.',
      tipo: tipo ? undefined : 'Escolha o tipo do dispositivo.',
      coordenada: ponto ? (localizacao.situacao === 'erro' ? localizacao.mensagem : undefined) : 'Marque o ponto no mapa ou informe latitude e longitude.',
      atributos: Object.keys(errosAtributos).length ? errosAtributos : undefined,
    };
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean) || !ponto) return;

    const dados: DadosDispositivo = {
      identificador: f.identificador.trim(),
      tipoDispositivoId: f.tipoDispositivoId,
      descricao: f.descricao.trim() || null,
      endereco: f.endereco.trim() || null,
      latitude: ponto.latitude,
      longitude: ponto.longitude,
      dataInstalacao: f.dataInstalacao || null,
      estado: f.estado,
      atributos,
    };
    setEnviando(true);
    try {
      aoSalvar(editando ? await dispositivosApi.atualizar(dispositivo.id, dados) : await dispositivosApi.criar(dados));
    } catch (e) {
      const mensagem = e instanceof ErroApi ? e.message : 'Não foi possível falar com o servidor. Tente de novo.';
      const status = e instanceof ErroApi ? e.status : 0;
      setErros(status === 409 ? { identificador: mensagem } : status === 422 ? { coordenada: mensagem } : { geral: mensagem });
    } finally {
      setEnviando(false);
    }
  }

  const opcoesGrandeza = grandezas.map((g) => ({ valor: g.codigo, rotulo: g.rotulo }));

  function campoAtributo(campo: CampoAtributo) {
    const erro = erros.atributos?.[campo.nome];
    const valor = f.atributos[campo.nome];
    if (campo.tipo === 'grandeza') {
      return (
        <Selecao key={campo.nome} rotulo={campo.rotulo} opcoes={opcoesGrandeza} vazio="Escolha" erro={erro}
          value={(valor as string) ?? ''} onChange={(e) => alterarAtributo(campo, e.target.value)} />
      );
    }
    if (campo.tipo === 'lista_grandezas') {
      const marcadas = (valor as string[] | undefined) ?? [];
      return (
        <fieldset key={campo.nome} className={estilos.lista}>
          <legend>{campo.rotulo}</legend>
          {grandezas.map((g) => (
            <CaixaSelecao key={g.codigo} rotulo={g.rotulo} checked={marcadas.includes(g.codigo)}
              onChange={(e) => alterarAtributo(campo, e.target.checked ? [...marcadas, g.codigo] : marcadas.filter((c) => c !== g.codigo))} />
          ))}
        </fieldset>
      );
    }
    return (
      <Campo key={campo.nome} rotulo={campo.rotulo} unidade={campo.unidade} erro={erro}
        inputMode={campo.tipo === 'inteiro' ? 'numeric' : undefined} className={campo.tipo === 'inteiro' ? 'numero' : undefined}
        value={(valor as string) ?? ''} onChange={(e) => alterarAtributo(campo, e.target.value)} />
    );
  }

  return (
    <aside className={estilos.painel} aria-label={editando ? `Editar ${dispositivo.identificador}` : 'Novo dispositivo'}>
      <header className={estilos.cabecalho}>
        <h2>{editando ? `Editar ${dispositivo.identificador}` : 'Novo dispositivo'}</h2>
        <Botao variante="link" onClick={aoFechar}>
          Fechar
        </Botao>
      </header>

      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <div className={estilos.corpo}>
          <div className={estilos.par}>
            <Campo rotulo="Código" className="numero" aria-invalid={erros.identificador ? true : undefined} maxLength={40}
              autoComplete="off" value={f.identificador} onChange={(e) => alterar('identificador', e.target.value)} />
            <Selecao rotulo="Tipo" vazio="Escolha o tipo" erro={erros.tipo} value={f.tipoDispositivoId}
              opcoes={tipos.map((t) => ({ valor: t.id, rotulo: t.nome }))} onChange={(e) => trocarTipo(e.target.value)} />
          </div>
          {erros.identificador && <Aviso>{erros.identificador}</Aviso>}

          <Campo rotulo="Descrição" maxLength={255} value={f.descricao} onChange={(e) => alterar('descricao', e.target.value)} />

          <div className={estilos.localizacao}>
            <span className={estilos.rotulo}>
              Localização <span className={estilos.dica}>· clique no mapa ou informe as coordenadas</span>
            </span>
            <MapaPonto ponto={ponto} rotulo="Mapa para marcar a localização do dispositivo"
              aoEscolher={(latitude, longitude) => setF((atual) => ({
                ...atual,
                latitude: String(latitude).replace('.', ','),
                longitude: String(longitude).replace('.', ','),
              }))} />
            <div className={estilos.par}>
              <Campo rotulo="Latitude" className="numero" inputMode="decimal" value={f.latitude} onChange={(e) => alterar('latitude', e.target.value)} />
              <Campo rotulo="Longitude" className="numero" inputMode="decimal" value={f.longitude} onChange={(e) => alterar('longitude', e.target.value)} />
            </div>
            <div className={estilos.bairro} aria-live="polite">
              <span>Bairro, pela coordenada</span>
              <strong>
                {localizacao.situacao === 'ok' &&
                  (localizacao.local.bairro ? (
                    <>
                      {localizacao.local.bairro} <span className={estilos.distrito}>· distrito {localizacao.local.distrito}</span>
                    </>
                  ) : (
                    <>
                      sem bairro <span className={estilos.distrito}>· zona rural, distrito {localizacao.local.distrito}</span>
                    </>
                  ))}
                {localizacao.situacao === 'buscando' && <span className={estilos.distrito}>consultando…</span>}
                {localizacao.situacao === 'vazia' && <span className={estilos.distrito}>–</span>}
                {localizacao.situacao === 'erro' && <span className={estilos.distrito}>–</span>}
              </strong>
            </div>
            {(erros.coordenada || localizacao.situacao === 'erro') && (
              <span className={estilos.erro} role="alert">
                {erros.coordenada ?? (localizacao.situacao === 'erro' ? localizacao.mensagem : '')}
              </span>
            )}
          </div>

          <Campo rotulo="Endereço" maxLength={255} value={f.endereco} onChange={(e) => alterar('endereco', e.target.value)} />

          <Campo rotulo="Instalado em" type="date" className={`numero ${estilos.data}`} value={f.dataInstalacao}
            onChange={(e) => alterar('dataInstalacao', e.target.value)} />
          <Segmentado rotulo="Situação" opcoes={ESTADOS} valor={f.estado} aoMudar={(estado) => alterar('estado', estado)} />
          {f.estado === 'inativo' && dispositivo?.estado !== 'inativo' && editando && (
            <p className={estilos.nota}>Inativar não exclui o dispositivo: o histórico de leituras continua disponível.</p>
          )}

          {tipo && tipo.campos.length > 0 && (
            <section className={estilos.atributos} aria-label={`Atributos de ${tipo.rotuloCategoria.toLowerCase()}`}>
              <h3>Atributos de {tipo.rotuloCategoria.toLowerCase()}</h3>
              <div className={estilos.grade}>{tipo.campos.map(campoAtributo)}</div>
            </section>
          )}

          {erros.geral && <Aviso>{erros.geral}</Aviso>}
        </div>

        <footer className={estilos.rodape}>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" variante="primario" disabled={enviando || !pode('configurar')} title={pode('configurar') ? undefined : SEM_PERMISSAO}>
            {enviando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Cadastrar'}
          </Botao>
        </footer>
      </form>
    </aside>
  );
}

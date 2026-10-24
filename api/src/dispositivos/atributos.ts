import { CODIGOS_GRANDEZA } from '../grandezas';

export type TipoCampo = 'texto' | 'inteiro' | 'grandeza' | 'lista_grandezas';

export interface CampoAtributo {
  nome: string;
  rotulo: string;
  tipo: TipoCampo;
  obrigatorio: boolean;
  minimo?: number;
  maximo?: number;
  unidade?: string;
}

export interface Categoria {
  rotulo: string;
  campos: CampoAtributo[];
}

// especializações de docs/diagrama-classes.drawio
export const CATEGORIAS: Record<string, Categoria> = {
  sensor_urbano: {
    rotulo: 'Sensor urbano',
    campos: [
      { nome: 'tipoGrandeza', rotulo: 'Grandeza', tipo: 'grandeza', obrigatorio: true },
      { nome: 'unidadeMedida', rotulo: 'Unidade', tipo: 'texto', obrigatorio: false },
      { nome: 'intervaloLeituraSegundos', rotulo: 'Intervalo de leitura', tipo: 'inteiro', obrigatorio: false, minimo: 1, unidade: 's' },
    ],
  },
  camera_monitoramento: {
    rotulo: 'Câmera de monitoramento',
    campos: [
      { nome: 'modelo', rotulo: 'Modelo', tipo: 'texto', obrigatorio: false },
      { nome: 'resolucao', rotulo: 'Resolução', tipo: 'texto', obrigatorio: false },
      { nome: 'anguloVisao', rotulo: 'Ângulo de visão', tipo: 'inteiro', obrigatorio: false, minimo: 1, maximo: 360, unidade: '°' },
    ],
  },
  semaforo_inteligente: {
    rotulo: 'Semáforo inteligente',
    campos: [
      { nome: 'tempoCicloSegundos', rotulo: 'Tempo de ciclo', tipo: 'inteiro', obrigatorio: false, minimo: 1, unidade: 's' },
      { nome: 'modoOperacao', rotulo: 'Modo de operação', tipo: 'texto', obrigatorio: false },
    ],
  },
  estacao_ambiental: {
    rotulo: 'Estação ambiental',
    campos: [
      { nome: 'fabricante', rotulo: 'Fabricante', tipo: 'texto', obrigatorio: false },
      { nome: 'variaveisMonitoradas', rotulo: 'Variáveis monitoradas', tipo: 'lista_grandezas', obrigatorio: false },
    ],
  },
  controlador_iluminacao: {
    rotulo: 'Controlador de iluminação',
    campos: [
      { nome: 'quantidadePontos', rotulo: 'Pontos de luz', tipo: 'inteiro', obrigatorio: true, minimo: 1 },
      { nome: 'intervaloLeituraSegundos', rotulo: 'Intervalo de leitura', tipo: 'inteiro', obrigatorio: false, minimo: 1, unidade: 's' },
    ],
  },
};

const TAMANHO_MAXIMO_TEXTO = 120;

export function validarAtributos(categoria: string, entrada: unknown): { atributos: Record<string, unknown>; erros: string[] } {
  const definicao = CATEGORIAS[categoria];
  const valores = (entrada ?? {}) as Record<string, unknown>;
  if (!definicao) return { atributos: {}, erros: [`Categoria de dispositivo desconhecida: ${categoria}.`] };
  if (typeof valores !== 'object' || Array.isArray(valores)) return { atributos: {}, erros: ['Os atributos do tipo devem ser um objeto.'] };

  const erros: string[] = [];
  const atributos: Record<string, unknown> = {};
  const conhecidos = new Set(definicao.campos.map((c) => c.nome));
  for (const nome of Object.keys(valores)) {
    if (!conhecidos.has(nome)) erros.push(`O atributo ${nome} não pertence a ${definicao.rotulo.toLowerCase()}.`);
  }

  for (const campo of definicao.campos) {
    const valor = valores[campo.nome];
    const vazio = valor === undefined || valor === null || valor === '' || (Array.isArray(valor) && valor.length === 0);
    if (vazio) {
      if (campo.obrigatorio) erros.push(`${campo.rotulo} é obrigatório para ${definicao.rotulo.toLowerCase()}.`);
      continue;
    }
    switch (campo.tipo) {
      case 'texto':
        if (typeof valor !== 'string' || valor.trim().length > TAMANHO_MAXIMO_TEXTO) {
          erros.push(`${campo.rotulo} deve ser um texto de até ${TAMANHO_MAXIMO_TEXTO} caracteres.`);
        } else atributos[campo.nome] = valor.trim();
        break;
      case 'inteiro':
        if (
          typeof valor !== 'number' ||
          !Number.isInteger(valor) ||
          (campo.minimo !== undefined && valor < campo.minimo) ||
          (campo.maximo !== undefined && valor > campo.maximo)
        ) {
          const faixa = campo.maximo !== undefined ? `entre ${campo.minimo} e ${campo.maximo}` : `a partir de ${campo.minimo}`;
          erros.push(`${campo.rotulo} deve ser um número inteiro ${faixa}.`);
        } else atributos[campo.nome] = valor;
        break;
      case 'grandeza':
        if (typeof valor !== 'string' || !CODIGOS_GRANDEZA.includes(valor as never)) {
          erros.push(`${campo.rotulo} inválida.`);
        } else atributos[campo.nome] = valor;
        break;
      case 'lista_grandezas':
        if (!Array.isArray(valor) || valor.some((v) => !CODIGOS_GRANDEZA.includes(v))) {
          erros.push(`${campo.rotulo} contém grandeza inválida.`);
        } else atributos[campo.nome] = [...new Set(valor)];
        break;
    }
  }
  return { atributos, erros };
}

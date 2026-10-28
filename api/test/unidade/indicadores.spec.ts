import { calcularIndicadores, EntradaIndicadores, Leitura } from '../../src/painel/indicadores';

let sequencia = 0;
const leitura = (grandeza: string, valor: number, extra: Partial<Leitura> = {}): Leitura => ({
  dispositivoId: String(++sequencia),
  identificador: `D-${sequencia}`,
  endereco: null,
  bairro: 'Centro',
  grandeza,
  valor,
  anterior: null,
  quantidadePontos: null,
  ...extra,
});

const calcular = (entrada: Partial<EntradaIndicadores>) =>
  Object.fromEntries(calcularIndicadores({ leituras: [], alertas: [], limites: [], mediasPm25: [], ...entrada }).map((i) => [i.chave, i]));

describe('cálculo dos indicadores do painel (US12)', () => {
  it('US12-1 os seis indicadores vêm na ordem do protótipo', () => {
    expect(calcularIndicadores({ leituras: [], alertas: [], limites: [], mediasPm25: [] }).map((i) => i.chave)).toEqual([
      'rios', 'fluxo', 'ar', 'iluminacao', 'ruido', 'vagas',
    ]);
  });

  it('US12-3 sem leitura, todos ficam sem dados e sem valor', () => {
    const todos = Object.values(calcular({}));
    expect(todos.every((i) => i.valor === null && i.estado === 'sem_dados' && i.nota === 'sem leitura na última hora')).toBe(true);
  });

  it('US12-1 nível dos rios: o maior nível, a variação por hora e o ponto acima da cota', () => {
    const { rios } = calcular({
      leituras: [leitura('nivel_agua', 2.1), leitura('nivel_agua', 3.9, { endereco: 'Arroio Olarias, ponte da Taunay', anterior: 3.6 })],
      limites: [{ grandeza: 'nivel_agua', limite: 3.5 }],
    });
    expect(rios).toMatchObject({ valor: 3.9, unidade: 'm', variacao: '+0,30 m/h', nota: 'Arroio Olarias acima da cota' });
    expect(rios.proporcao).toBeCloseTo(3.9 / (3.5 / 0.8));
  });

  it('US12-1 nível dos rios: abaixo da cota conta os pontos e sem cota não tem barra', () => {
    expect(calcular({ leituras: [leitura('nivel_agua', 2), leitura('nivel_agua', 1)], limites: [{ grandeza: 'nivel_agua', limite: 4 }] }).rios).toMatchObject({
      nota: '2 pontos abaixo da cota',
      proporcao: 2 / 5,
    });
    expect(calcular({ leituras: [leitura('nivel_agua', 2)] }).rios.proporcao).toBeNull();
  });

  it('US12-1 fluxo: média das velocidades e variação contra a média de uma hora antes', () => {
    const { fluxo } = calcular({ leituras: [leitura('velocidade_media', 30, { anterior: 40 }), leitura('velocidade_media', 50, { anterior: 50 })] });
    expect(fluxo).toMatchObject({ valor: 40, variacao: '−5 km/h', nota: '2 vias monitoradas', proporcao: 40 / 60 });
  });

  it('US12-1 qualidade do ar: pior IQAr pela média de 24 h, com a qualidade e os bairros', () => {
    const a = leitura('pm25', 10, { bairro: 'Centro' });
    const b = leitura('pm25', 200, { bairro: 'Uvaranas' });
    const { ar } = calcular({
      leituras: [a, b],
      mediasPm25: [
        { dispositivoId: a.dispositivoId, atual: 60, anterior: 60 },
        { dispositivoId: b.dispositivoId, atual: 20, anterior: 10 },
      ],
    });
    expect(ar).toMatchObject({ valor: 96, unidade: 'IQAr', variacao: 'estável', nota: 'ruim em 1 bairro' });
  });

  it('US12-1 qualidade do ar: sem média usa a última leitura, e a variação acima de 5 pontos aparece com sinal', () => {
    const a = leitura('pm25', 16);
    expect(calcular({ leituras: [a] }).ar).toMatchObject({ valor: 41, variacao: null });
    expect(calcular({ leituras: [a], mediasPm25: [{ dispositivoId: a.dispositivoId, atual: 50, anterior: 16 }] }).ar.variacao).toBe('+39');
  });

  it('US12-1 iluminação: parcela de pontos respondendo pelo total dos controladores', () => {
    const { iluminacao } = calcular({
      leituras: [leitura('pontos_apagados', 1, { quantidadePontos: 9, anterior: 0 }), leitura('pontos_apagados', 0, { quantidadePontos: 11, anterior: 0 })],
    });
    expect(iluminacao).toMatchObject({ valor: 95, variacao: '−5,0 pt', nota: '1 ponto sem resposta', proporcao: 0.95 });
  });

  it('US12-1 ruído: o maior nível, dentro ou acima do limite da regra', () => {
    const limites = [{ grandeza: 'nivel_sonoro', limite: 70 }];
    expect(calcular({ leituras: [leitura('nivel_sonoro', 72.4, { anterior: 72 })], limites }).ruido).toMatchObject({
      valor: 72.4,
      variacao: 'estável',
      nota: 'acima do limite de 70 dB',
    });
    expect(calcular({ leituras: [leitura('nivel_sonoro', 60)] }).ruido.nota).toBe('1 ponto medido');
  });

  it('US12-1 vagas: soma das vagas livres e variação', () => {
    expect(calcular({ leituras: [leitura('vagas_livres', 12, { anterior: 10 }), leitura('vagas_livres', 3, { anterior: 3 })] }).vagas).toMatchObject({
      valor: 15,
      variacao: '+2',
      nota: 'livres em 2 sensores',
    });
  });

  it('US12-2 tabela de decisão do estado: grave vence atenção, atenção vence estável, só da mesma grandeza', () => {
    const leituras = [leitura('nivel_agua', 2), leitura('nivel_sonoro', 50)];
    const estado = (alertas: EntradaIndicadores['alertas']) => {
      const r = calcular({ leituras, alertas });
      return [r.rios.estado, r.ruido.estado];
    };
    expect(estado([])).toEqual(['estavel', 'estavel']);
    expect(estado([{ grandeza: 'nivel_agua', criticidade: 'atencao' }])).toEqual(['atencao', 'estavel']);
    expect(estado([{ grandeza: 'nivel_agua', criticidade: 'atencao' }, { grandeza: 'nivel_agua', criticidade: 'grave' }])).toEqual(['grave', 'estavel']);
    expect(estado([{ grandeza: 'nivel_sonoro', criticidade: 'informativo' }])).toEqual(['estavel', 'estavel']);
  });
});

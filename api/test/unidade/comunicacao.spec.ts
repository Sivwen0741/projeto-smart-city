import { limiteComunicacaoSegundos, situacaoDispositivo } from '../../src/dispositivos/comunicacao';

const agora = new Date('2026-10-28T12:00:00Z');
const antes = (segundos: number) => new Date(agora.getTime() - segundos * 1000);
const ativo = (ultimaComunicacao: Date | null, intervaloDispositivo: number | null = null, intervaloTipo: number | null = 30) =>
  situacaoDispositivo({ estado: 'ativo', ultimaComunicacao, intervaloDispositivo, intervaloTipo, agora });

describe('limiar de sem comunicação (US22-6)', () => {
  it('US22-6 o limite é duas vezes o intervalo do dispositivo, senão o do tipo, senão 30 minutos', () => {
    expect(limiteComunicacaoSegundos(10, 30)).toBe(20);
    expect(limiteComunicacaoSegundos(null, 30)).toBe(60);
    expect(limiteComunicacaoSegundos(null, null)).toBe(1800);
  });

  it('US22-6 valor limite: no limite exato continua operando, um segundo depois fica sem comunicação', () => {
    expect(ativo(antes(60))).toBe('operando');
    expect(ativo(antes(61))).toBe('sem_comunicacao');
    expect(ativo(antes(1800), null, null)).toBe('operando');
    expect(ativo(antes(1801), null, null)).toBe('sem_comunicacao');
  });

  it('US22-6 partições: nunca comunicou, manutenção e inativo', () => {
    expect(ativo(null)).toBe('sem_comunicacao');
    for (const estado of ['manutencao', 'inativo'] as const) {
      expect(situacaoDispositivo({ estado, ultimaComunicacao: antes(99_999), intervaloDispositivo: null, intervaloTipo: 30, agora })).toBe(estado);
    }
  });
});

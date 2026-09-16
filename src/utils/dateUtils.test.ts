import { describe, it, expect } from 'vitest';
import { formatarDataBr, limparDescricaoMulta } from './dateUtils';

describe('formatarDataBr', () => {
  it('converte do formato do banco para o brasileiro', () => {
    expect(formatarDataBr('2026-08-23')).toBe('23/08/2026');
  });

  it('mantém data que já vem com barras', () => {
    expect(formatarDataBr('23/08/2026')).toBe('23/08/2026');
  });

  it('completa com zero à esquerda', () => {
    expect(formatarDataBr('5/9/2026')).toBe('05/09/2026');
  });

  it('mostra traço quando não há data', () => {
    expect(formatarDataBr(undefined)).toBe('—');
    expect(formatarDataBr('')).toBe('—');
  });
});

describe('limparDescricaoMulta', () => {
  it('remove o prefixo MULTA repetido', () => {
    expect(limparDescricaoMulta('MULTA. POR EXCESSO DE VELOCIDADE')).toBe('Por excesso de velocidade');
  });

  it('usa texto padrão quando vem vazio', () => {
    expect(limparDescricaoMulta(undefined)).toBe('Infração de Trânsito');
  });
});

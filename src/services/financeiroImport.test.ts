import { describe, it, expect } from 'vitest';
import { interpretarAcerto } from './financeiroImport';

describe('interpretarAcerto', () => {
  it('lê o formato padrão da planilha', () => {
    expect(interpretarAcerto('02X65,08')).toEqual({ parcelas: 2, valorParcela: 65.08 });
  });

  it('aceita x minúsculo', () => {
    expect(interpretarAcerto('03x293,47')).toEqual({ parcelas: 3, valorParcela: 293.47 });
  });

  it('aceita espaço no meio', () => {
    expect(interpretarAcerto('02x 146,74')).toEqual({ parcelas: 2, valorParcela: 146.74 });
  });

  it('aceita parcela única', () => {
    expect(interpretarAcerto('01X130,16')).toEqual({ parcelas: 1, valorParcela: 130.16 });
  });

  it('trata número solto como parcela única', () => {
    expect(interpretarAcerto(390.46)).toEqual({ parcelas: 1, valorParcela: 390.46 });
  });

  it('devolve nulo para valor vazio ou inválido', () => {
    expect(interpretarAcerto('')).toBeNull();
    expect(interpretarAcerto(null)).toBeNull();
    expect(interpretarAcerto('texto qualquer')).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { montarLancamentoDeSinistro, montarLancamentoDeMulta, indicacaoPeloTermo } from './lancamentoFinanceiro';
import { Claim, Fine, Term } from '../types';

const multaBase = {
  id: 'f1',
  infractionAuto: 'M000016563',
  vehiclePlate: 'ABC1D23',
  driverName: 'JOAO DA SILVA',
  description: 'MULTA. POR EXCESSO DE VELOCIDADE',
  amount: 130.16,
  points: 5,
  dueDate: '2026-08-23',
  status: 'Pendente',
} as Fine;

const sinistroBase = {
  id: 'c1',
  claimNumber: 'SIN-2026-01',
  driverName: 'MARIA SOUZA',
  occurrenceType: 'Colisão',
  date: '2026-07-10',
  estimatedCost: 900,
  status: 'Em análise',
  priority: 'Média',
} as Claim;

const termoComParcelas = (parcelas: number, extras: Partial<Term> = {}) =>
  ({ id: 't1', status: 'Assinado', installmentsCount: parcelas, ...extras } as Term);

describe('montarLancamentoDeMulta', () => {
  it('divide o valor pelo número de parcelas do termo', () => {
    const l = montarLancamentoDeMulta(multaBase, termoComParcelas(2));
    expect(l?.installmentsCount).toBe(2);
    expect(l?.installmentValue).toBe(65.08);
    expect(l?.totalAmount).toBe(130.16);
  });

  it('usa parcela única quando não há termo', () => {
    const l = montarLancamentoDeMulta(multaBase);
    expect(l?.installmentsCount).toBe(1);
    expect(l?.installmentValue).toBe(130.16);
  });

  it('prefere a data de pagamento do termo ao vencimento da multa', () => {
    const l = montarLancamentoDeMulta(multaBase, termoComParcelas(1, { paymentDate: '2026-09-05' }));
    expect(l?.firstDueDate).toBe('2026-09-05');
  });

  it('não gera lançamento quando o valor é zero', () => {
    expect(montarLancamentoDeMulta({ ...multaBase, amount: 0 })).toBeNull();
  });

  it('sempre cobra do condutor', () => {
    expect(montarLancamentoDeMulta(multaBase)?.direction).toBe('Cobrar');
  });
});

describe('montarLancamentoDeSinistro', () => {
  it('respeita o parcelamento do termo', () => {
    const l = montarLancamentoDeSinistro(sinistroBase, termoComParcelas(3));
    expect(l?.installmentsCount).toBe(3);
    expect(l?.installmentValue).toBe(300);
  });

  it('usa parcela única quando não há termo', () => {
    expect(montarLancamentoDeSinistro(sinistroBase)?.installmentsCount).toBe(1);
  });

  it('respeita a direção de pagamento do sinistro', () => {
    const l = montarLancamentoDeSinistro({ ...sinistroBase, paymentDirection: 'Pagar' } as Claim);
    expect(l?.direction).toBe('Pagar');
  });

  it('não gera lançamento sem valor', () => {
    expect(montarLancamentoDeSinistro({ ...sinistroBase, estimatedCost: 0 } as Claim)).toBeNull();
  });
});

describe('indicacaoPeloTermo', () => {
  it('empresa paga a multa vira Indicado/Trans Pinho', () => {
    const t = { templateId: 'tmpl-empresa-paga-multa' } as Term;
    expect(indicacaoPeloTermo(t, multaBase)).toBe('INDICADO/TRANS PINHO');
  });

  it('multa descontada normal vira Indicado', () => {
    const t = { templateId: 'tmpl-multa-descontada' } as Term;
    expect(indicacaoPeloTermo(t, multaBase)).toBe('INDICADO');
  });

  it('multa descontada duplicada vira Indicado/Dobrado', () => {
    const t = { templateId: 'tmpl-multa-descontada' } as Term;
    expect(indicacaoPeloTermo(t, { ...multaBase, duplicateOfAuto: 'M000011111' })).toBe('INDICADO/DOBRADO');
  });

  it('outros modelos não mudam a indicação', () => {
    expect(indicacaoPeloTermo({ templateId: 'tmpl-outro' } as Term, multaBase)).toBeUndefined();
  });
});

import { Claim, Fine, Term, FinancialEntry } from '../types';
import { limparDescricaoMulta } from './dateUtils';

const hoje = () => new Date().toISOString().split('T')[0];

/**
 * Monta o lançamento financeiro de um SINISTRO. Devolve null quando não há
 * valor a lançar. O parcelamento vem do termo assinado, quando existir.
 */
export function montarLancamentoDeSinistro(
  claim: Claim,
  termo?: Term
): Omit<FinancialEntry, 'id'> | null {
  const total = claim.totalValue || claim.approvedCost || claim.estimatedCost || 0;
  if (total <= 0) return null;

  const numParcelas = termo?.installmentsCount && termo.installmentsCount > 0 ? termo.installmentsCount : 1;

  return {
    driverName: claim.driverName || 'Condutor Não Informado',
    originType: 'Sinistro',
    originId: claim.id,
    originLabel: claim.claimNumber,
    description: `Sinistro ${claim.claimNumber} - ${claim.occurrenceType || 'Ocorrência'}`,
    direction: (claim.paymentDirection as 'Cobrar' | 'Pagar') || 'Cobrar',
    totalAmount: total,
    installmentsCount: numParcelas,
    installmentValue: Math.round((total / numParcelas) * 100) / 100,
    paidInstallments: 0,
    firstDueDate: termo?.paymentDate || claim.date || hoje(),
    status: 'Pendente',
    notes: claim.description ? `Sinistro: ${claim.description.slice(0, 150)}` : undefined,
  };
}

/**
 * Monta o lançamento financeiro de uma MULTA. Devolve null quando não há
 * valor a lançar. O parcelamento vem do termo assinado, quando existir.
 */
export function montarLancamentoDeMulta(
  fine: Fine,
  termo?: Term
): Omit<FinancialEntry, 'id'> | null {
  const total = fine.amount || 0;
  if (total <= 0) return null;

  const numParcelas = termo?.installmentsCount && termo.installmentsCount > 0 ? termo.installmentsCount : 1;

  return {
    driverName: fine.driverName || 'Condutor Não Informado',
    originType: 'Multa',
    originId: fine.id,
    originLabel: fine.infractionAuto || fine.infractionCode || 'Multa',
    description: `${fine.infractionAuto || fine.infractionCode || 'Multa'}`,
    originDetail: limparDescricaoMulta(fine.description),
    direction: 'Cobrar',
    totalAmount: total,
    installmentsCount: numParcelas,
    installmentValue: Math.round((total / numParcelas) * 100) / 100,
    paidInstallments: 0,
    firstDueDate: termo?.paymentDate || fine.dueDate || hoje(),
    status: 'Pendente',
    notes: `Placa: ${fine.vehiclePlate}`,
  };
}

/**
 * Decide a nova Indicação do Condutor a partir do modelo de termo assinado.
 * Devolve undefined quando o termo não afeta a indicação.
 */
export function indicacaoPeloTermo(term: Term, fine: Fine): string | undefined {
  if (term.templateId === 'tmpl-empresa-paga-multa') return 'INDICADO/TRANS PINHO';
  if (term.templateId === 'tmpl-multa-descontada') {
    return fine.duplicateOfAuto ? 'INDICADO/DOBRADO' : 'INDICADO';
  }
  return undefined;
}

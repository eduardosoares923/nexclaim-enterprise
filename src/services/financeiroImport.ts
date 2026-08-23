import * as XLSX from 'xlsx';
// @ts-ignore
import * as XLSXStyle from 'xlsx-js-style';
import { FinancialEntry, FinancialEntryStatus, FinancialEntryOrigin } from '../types';

function paraTexto(valor: any): string {
  if (valor === null || valor === undefined) return '';
  if (valor instanceof Date) {
    return `${String(valor.getDate()).padStart(2, '0')}/${String(valor.getMonth() + 1).padStart(2, '0')}/${valor.getFullYear()}`;
  }
  return String(valor).trim();
}

function paraData(valor: any): string {
  if (!valor) return '';
  if (valor instanceof Date) return valor.toISOString().split('T')[0];
  const texto = String(valor).trim();
  const partesBr = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (partesBr) return `${partesBr[3]}-${partesBr[2].padStart(2, '0')}-${partesBr[1].padStart(2, '0')}`;
  return texto;
}

function paraNumero(valor: any): number {
  if (valor === null || valor === undefined || valor === '') return 0;
  if (typeof valor === 'number') return valor;
  const limpo = String(valor).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3},)/g, '').replace(',', '.');
  const n = parseFloat(limpo);
  return isNaN(n) ? 0 : n;
}

function acharColuna(headers: string[], candidatos: string[]): number {
  const normalizados = headers.map((h) => (h ?? '').toString().trim().toUpperCase());
  for (const c of candidatos) {
    const i = normalizados.indexOf(c.toUpperCase());
    if (i !== -1) return i;
  }
  return -1;
}

function statusDoLancamento(texto: string): FinancialEntryStatus {
  const t = (texto || '').trim().toUpperCase();
  if (t.includes('QUIT') || t.includes('PAG')) return 'Quitado';
  if (t.includes('DESCONT') || t.includes('ANDAMENT')) return 'Em Desconto';
  if (t.includes('CANCEL')) return 'Cancelado';
  return 'Pendente';
}

function originDoLancamento(texto: string): FinancialEntryOrigin {
  const t = (texto || '').trim().toUpperCase();
  if (t.includes('SINISTR')) return 'Sinistro';
  if (t.includes('MULT')) return 'Multa';
  return 'Outro';
}

export interface ColunaExportacaoFinanceiro {
  chave: string;
  rotulo: string;
}

export const COLUNAS_EXPORTACAO_FINANCEIRO: ColunaExportacaoFinanceiro[] = [
  { chave: 'driverName', rotulo: 'Condutor' },
  { chave: 'originType', rotulo: 'Origem' },
  { chave: 'originLabel', rotulo: 'Referência' },
  { chave: 'description', rotulo: 'Descrição' },
  { chave: 'direction', rotulo: 'Direção' },
  { chave: 'totalAmount', rotulo: 'Valor Total' },
  { chave: 'installmentsCount', rotulo: 'Qtd. Parcelas' },
  { chave: 'installmentValue', rotulo: 'Valor da Parcela' },
  { chave: 'paidInstallments', rotulo: 'Parcelas Pagas' },
  { chave: 'firstDueDate', rotulo: 'Vencimento' },
  { chave: 'status', rotulo: 'Status' },
  { chave: 'notes', rotulo: 'Observações' },
];

export function exportarFinanceiroParaExcel(entries: FinancialEntry[]) {
  if (!entries || entries.length === 0) {
    alert('Nenhum lançamento para exportar.');
    return;
  }

  const linhas = entries.map((e: any) => {
    const row: Record<string, any> = {};
    COLUNAS_EXPORTACAO_FINANCEIRO.forEach((col) => {
      row[col.rotulo] = e[col.chave] ?? '';
    });
    return row;
  });

  const worksheet = XLSXStyle.utils.json_to_sheet(linhas);
  const headers = Object.keys(linhas[0] || {});
  worksheet['!cols'] = headers.map((h) => ({
    wch: Math.min(Math.max(Math.max(h.length, ...linhas.map((l: any) => String(l[h] ?? '').length)) + 2, 10), 40),
  }));
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  worksheet['!autofilter'] = { ref: worksheet['!ref'] || 'A1' };

  headers.forEach((_, i) => {
    const endereco = XLSXStyle.utils.encode_cell({ r: 0, c: i });
    if (worksheet[endereco]) {
      worksheet[endereco].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1E293B' } },
      };
    }
  });

  const workbook = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Financeiro');
  XLSXStyle.writeFile(workbook, `Financeiro_TransPinho_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export async function lerPlanilhaFinanceiro(file: File): Promise<Omit<FinancialEntry, 'id'>[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const linhas: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  const indiceHeader = linhas.findIndex((linha) => linha.some((c) => (c ?? '').toString().trim().toUpperCase() === 'CONDUTOR'));
  if (indiceHeader === -1) {
    throw new Error('Não foi possível identificar a linha de cabeçalho (coluna "Condutor") na planilha.');
  }

  const headers = linhas[indiceHeader].map((h) => (h ?? '').toString());
  const idx = {
    condutor: acharColuna(headers, ['CONDUTOR']),
    origem: acharColuna(headers, ['ORIGEM']),
    referencia: acharColuna(headers, ['REFERÊNCIA', 'REFERENCIA']),
    descricao: acharColuna(headers, ['DESCRIÇÃO', 'DESCRICAO']),
    direcao: acharColuna(headers, ['DIREÇÃO', 'DIRECAO']),
    valorTotal: acharColuna(headers, ['VALOR TOTAL']),
    qtdParcelas: acharColuna(headers, ['QTD. PARCELAS', 'QTD PARCELAS']),
    valorParcela: acharColuna(headers, ['VALOR DA PARCELA']),
    parcelasPagas: acharColuna(headers, ['PARCELAS PAGAS']),
    vencimento: acharColuna(headers, ['VENCIMENTO']),
    status: acharColuna(headers, ['STATUS']),
    obs: acharColuna(headers, ['OBSERVAÇÕES', 'OBSERVACOES']),
  };

  const pegar = (linha: any[], i: number) => (i === -1 ? undefined : linha[i]);
  const resultado: Omit<FinancialEntry, 'id'>[] = [];

  for (let l = indiceHeader + 1; l < linhas.length; l++) {
    const linha = linhas[l];
    if (!linha) continue;
    const condutor = paraTexto(pegar(linha, idx.condutor));
    if (!condutor) continue;

    const direcaoTexto = paraTexto(pegar(linha, idx.direcao)).toUpperCase();
    const qtdParcelas = parseInt(paraTexto(pegar(linha, idx.qtdParcelas))) || 1;

    resultado.push({
      driverName: condutor,
      originType: originDoLancamento(paraTexto(pegar(linha, idx.origem))),
      originLabel: paraTexto(pegar(linha, idx.referencia)) || undefined,
      description: paraTexto(pegar(linha, idx.descricao)) || 'Lançamento Importado',
      direction: direcaoTexto.includes('PAGAR') ? 'Pagar' : 'Cobrar',
      totalAmount: paraNumero(pegar(linha, idx.valorTotal)),
      installmentsCount: qtdParcelas,
      installmentValue: paraNumero(pegar(linha, idx.valorParcela)) || (paraNumero(pegar(linha, idx.valorTotal)) / qtdParcelas),
      paidInstallments: parseInt(paraTexto(pegar(linha, idx.parcelasPagas))) || 0,
      firstDueDate: paraData(pegar(linha, idx.vencimento)) || undefined,
      status: statusDoLancamento(paraTexto(pegar(linha, idx.status))),
      notes: paraTexto(pegar(linha, idx.obs)) || undefined,
    });
  }

  return resultado;
}

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
    throw new Error('Nenhum lançamento para exportar.');
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

function interpretarAcerto(valor: any): { parcelas: number; valorParcela: number } | null {
  if (!valor) return null;
  const texto = String(valor).trim();
  const match = texto.match(/(\d+)\s*[xX]\s*(?:R\$\s*)?([\d.,]+)?/);
  if (match) {
    const parcelas = parseInt(match[1], 10) || 1;
    const valorParcela = match[2] ? paraNumero(match[2]) : 0;
    return { parcelas, valorParcela };
  }
  const n = paraNumero(texto);
  if (n > 0) {
    return { parcelas: 1, valorParcela: n };
  }
  return null;
}

/**
 * Lista as abas da planilha que parecem ter descontos (têm coluna MOTORISTA),
 * pra o usuário escolher qual importar.
 */
export async function listarAbasDeDescontos(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  return workbook.SheetNames.filter((nome) => {
    const linhas: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[nome], {
      header: 1,
      defval: null,
    });
    return linhas
      .slice(0, 10)
      .some((linha) =>
        (linha || []).some((c) => (c ?? '').toString().trim().toUpperCase() === 'MOTORISTA')
      );
  });
}

/**
 * Lê uma aba de descontos e devolve os lançamentos financeiros prontos.
 * Cobre tanto a aba "PAGAMENTO." do relatório de infrações quanto as abas
 * mensais do arquivo de Descontos.
 */
export async function lerPlanilhaDescontos(
  file: File,
  nomeAbaEscolhida?: string
): Promise<Omit<FinancialEntry, 'id'>[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const nomeAba =
    nomeAbaEscolhida ||
    workbook.SheetNames.find((n) => n.trim().toUpperCase() === 'PAGAMENTO.') ||
    workbook.SheetNames.find((n) => n.trim().toUpperCase().startsWith('PAGAMENTO'));

  if (!nomeAba || !workbook.Sheets[nomeAba]) {
    throw new Error('Não encontrei a aba de descontos nessa planilha.');
  }

  const linhas: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[nomeAba], {
    header: 1,
    defval: null,
  });

  const indiceHeader = linhas.findIndex((linha) =>
    (linha || []).some((c) => (c ?? '').toString().trim().toUpperCase() === 'MOTORISTA')
  );
  if (indiceHeader === -1) {
    throw new Error(`A aba "${nomeAba}" não tem a coluna MOTORISTA.`);
  }

  const headers = linhas[indiceHeader].map((h) => (h ?? '').toString());
  const idx = {
    descricao: acharColuna(headers, ['DESCRIÇÃO', 'DESCRICAO']),
    placa: acharColuna(headers, ['PLACA']),
    prefixo: acharColuna(headers, ['PREFIXO']),
    auto: acharColuna(headers, ['AUTO DA INFRAÇÃO', 'AUTO DA INFRACAO', 'Nº REGISTRO', 'N REGISTRO', 'No REGISTRO']),
    data: acharColuna(headers, ['DATA DA MULTA', 'DATA DO ACONTECIDO', 'DATA DO ACONTECIMENTO']),
    valor: acharColuna(headers, ['VALOR']),
    motorista: acharColuna(headers, ['MOTORISTA']),
    multaPaga: acharColuna(headers, ['MULTA PAGA']),
    tipo: acharColuna(headers, ['TIPO DE MULTA']),
    acerto: acharColuna(headers, ['ACERTO']),
    dataDesconto: acharColuna(headers, ['DATA DESCONTO']),
  };

  const pegar = (linha: any[], i: number) => (i === -1 ? undefined : linha[i]);
  const resultado: Omit<FinancialEntry, 'id'>[] = [];

  for (let l = indiceHeader + 1; l < linhas.length; l++) {
    const linha = linhas[l];
    if (!linha) continue;

    const motorista = paraTexto(pegar(linha, idx.motorista));
    if (!motorista) continue;

    const auto = paraTexto(pegar(linha, idx.auto));
    const acerto = interpretarAcerto(pegar(linha, idx.acerto));
    const valorPlanilha = paraNumero(pegar(linha, idx.valor));

    const parcelas = acerto?.parcelas || 1;
    const valorParcela = acerto?.valorParcela || valorPlanilha;
    const total = acerto ? Math.round(parcelas * valorParcela * 100) / 100 : valorPlanilha;
    if (total <= 0) continue;

    const descricaoLinha = paraTexto(pegar(linha, idx.descricao)).toUpperCase();
    const origem: FinancialEntry['originType'] = descricaoLinha.includes('SINISTRO') ? 'Sinistro' : 'Multa';

    const placa = paraTexto(pegar(linha, idx.placa));
    const prefixo = paraTexto(pegar(linha, idx.prefixo));
    const tipo = paraTexto(pegar(linha, idx.tipo));
    const enviadoFinanceiro = paraTexto(pegar(linha, idx.multaPaga)).toUpperCase().includes('ENVIADO');

    const detalhes = [placa && `Placa: ${placa}`, prefixo && `Prefixo: ${prefixo}`]
      .filter(Boolean)
      .join(' | ');

    resultado.push({
      driverName: motorista,
      originType: origem,
      originId: undefined,
      originLabel: auto || undefined,
      description: auto || (origem === 'Sinistro' ? 'Desconto de Sinistro' : 'Desconto de Multa'),
      originDetail: tipo || undefined,
      direction: 'Cobrar',
      totalAmount: total,
      installmentsCount: parcelas,
      installmentValue: valorParcela,
      paidInstallments: 0,
      firstDueDate:
        paraData(pegar(linha, idx.dataDesconto)) || paraData(pegar(linha, idx.data)) || undefined,
      status: 'Pendente',
      notes: [detalhes, enviadoFinanceiro ? 'Enviado ao financeiro' : ''].filter(Boolean).join(' | ') || undefined,
    });
  }

  if (resultado.length === 0) {
    throw new Error(`Nenhum desconto válido encontrado na aba "${nomeAba}".`);
  }

  return resultado;
}

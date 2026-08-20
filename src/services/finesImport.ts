import * as XLSX from 'xlsx';
// @ts-ignore
import * as XLSXStyle from 'xlsx-js-style';
import { Fine, FineStatus } from '../types';

const NORMALIZAR = (s: any) => (s ?? '').toString().trim().toUpperCase();

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
  if (typeof valor === 'number') {
    const data = XLSX.SSF.parse_date_code(valor);
    if (data) return `${data.y}-${String(data.m).padStart(2, '0')}-${String(data.d).padStart(2, '0')}`;
  }
  const str = String(valor).trim();
  if (str.includes('/')) {
    const [dia, mes, ano] = str.split('/');
    if (dia && mes && ano) {
      const a = ano.length === 2 ? `20${ano}` : ano;
      return `${a}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
  }
  return str.split(' ')[0] || '';
}

function paraNumero(valor: any): number {
  if (valor === null || valor === undefined || valor === '') return 0;
  if (typeof valor === 'number') return valor;
  const n = parseFloat(String(valor).replace(/[^\d,.-]/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function acharColuna(headers: string[], candidatos: string[]): number {
  for (const c of candidatos) {
    const idx = headers.findIndex((h) => NORMALIZAR(h) === NORMALIZAR(c));
    if (idx !== -1) return idx;
  }
  return -1;
}

function statusDaMulta(multaPaga: string): FineStatus {
  const v = NORMALIZAR(multaPaga);
  if (v.includes('DESCONTAD') || v.includes('DESCONTANDO') || v.includes('PAGA') || v === 'SIM') return 'Paga';
  return 'Pendente';
}

export interface LinhaMultaImportada {
  fine: Omit<Fine, 'id'>;
  linhaOriginal: number;
}

export async function lerPlanilhaMultas(file: File): Promise<LinhaMultaImportada[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const nomeAba = workbook.SheetNames.find((n) => NORMALIZAR(n) === 'RELATORIO') || workbook.SheetNames[0];
  const sheet = workbook.Sheets[nomeAba];
  const linhas: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  const indiceHeader = linhas.findIndex((linha) => linha.some((c) => NORMALIZAR(c) === 'PLACA'));
  if (indiceHeader === -1) {
    throw new Error('Não foi possível identificar a linha de cabeçalho (coluna PLACA) na planilha.');
  }

  const headers = linhas[indiceHeader].map((h) => (h ?? '').toString());
  const idx = {
    placa: acharColuna(headers, ['PLACA']),
    prefixo: acharColuna(headers, ['PREFIXO']),
    auto: acharColuna(headers, ['AUTO DA INFRAÇÃO', 'AUTO DA INFRACAO', 'AUTO DE INFRAÇÃO', 'AUTO']),
    data: acharColuna(headers, ['DATA DA MULTA', 'DATA', 'DATA_FORMATADA']),
    horario: acharColuna(headers, ['HORARIO', 'HORÁRIO', 'HORARIO2']),
    valor: acharColuna(headers, ['VALOR']),
    vencIndicacao: acharColuna(headers, ['DATA VENC. INDICAÇÃO', 'DATA VENC INDICACAO', 'DATA VENCIMENTO', 'VENCIMENTO']),
    motorista: acharColuna(headers, ['MOTORISTA', 'CONDUTOR']),
    indicado: acharColuna(headers, ['INDICADO']),
    multaPaga: acharColuna(headers, ['MULTA PAGA', 'STATUS', 'SITUAÇÃO']),
    tipoMulta: acharColuna(headers, ['TIPO DE MULTA', 'ENQUADRAMENTO', 'DESCRICAO', 'DESCRIÇÃO']),
    duplicidade: acharColuna(headers, ['DUPLICIDADE', 'NIC']),
    pontos: acharColuna(headers, ['QTS PONTOS', 'QUANT. PONTOS CARTEIRA', 'PONTOS']),
    quantoCobrar: acharColuna(headers, ['QUANTO COBRAR']),
    dataDesconto: acharColuna(headers, ['DATA DESCONTO']),
    obs: acharColuna(headers, ['OBS', 'OBSERVAÇÃO', 'OBSERVACOES']),
  };

  const pegar = (linha: any[], i: number) => (i === -1 ? undefined : linha[i]);
  const resultado: LinhaMultaImportada[] = [];

  for (let l = indiceHeader + 1; l < linhas.length; l++) {
    const linha = linhas[l];
    if (!linha) continue;

    const placa = paraTexto(pegar(linha, idx.placa));
    const auto = paraTexto(pegar(linha, idx.auto));
    if (!placa && !auto) continue;

    const rawPontos = paraTexto(pegar(linha, idx.pontos));
    const parsedPontos = parseInt(rawPontos) || 0;

    const fine: Omit<Fine, 'id'> = {
      infractionAuto: auto || `IMP-${l}`,
      vehiclePlate: placa,
      vehiclePrefix: paraTexto(pegar(linha, idx.prefixo)) || undefined,
      driverName: paraTexto(pegar(linha, idx.motorista)),
      description: paraTexto(pegar(linha, idx.tipoMulta)) || 'Não especificado',
      amount: paraNumero(pegar(linha, idx.valor)),
      points: parsedPontos,
      dueDate: paraData(pegar(linha, idx.vencIndicacao)),
      status: statusDaMulta(paraTexto(pegar(linha, idx.multaPaga))),
      infractionDate: paraData(pegar(linha, idx.data)),
      infractionTime: paraTexto(pegar(linha, idx.horario)) || undefined,
      indicationStatus: paraTexto(pegar(linha, idx.indicado)) || undefined,
      duplicateInfo: paraTexto(pegar(linha, idx.duplicidade)) || undefined,
      chargeInstallments: paraTexto(pegar(linha, idx.quantoCobrar)) || undefined,
      discountDate: paraData(pegar(linha, idx.dataDesconto)) || undefined,
      notes: paraTexto(pegar(linha, idx.obs)) || undefined,
    };

    resultado.push({ fine, linhaOriginal: l + 1 });
  }

  return resultado;
}

export function exportarMultasParaExcel(fines: Fine[]) {
  if (!fines || fines.length === 0) {
    alert('Nenhuma multa selecionada para exportação.');
    return;
  }

  const linhas = fines.map((f: any) => ({
    'AUTO DA INFRAÇÃO': f.infractionAuto,
    PLACA: f.vehiclePlate,
    PREFIXO: f.vehiclePrefix || '',
    MOTORISTA: f.driverName,
    'DATA DA MULTA': f.infractionDate || '',
    HORARIO: f.infractionTime || '',
    'TIPO DE MULTA': f.description,
    VALOR: f.amount,
    PONTOS: f.points,
    'VENCIMENTO INDICAÇÃO': f.dueDate || '',
    STATUS: f.status,
    INDICADO: f.indicationStatus || '',
    DUPLICIDADE: f.duplicateInfo || '',
    'QUANTO COBRAR': f.chargeInstallments || '',
    'DATA DESCONTO': f.discountDate || '',
    OBS: f.notes || '',
  }));

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
  XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Multas');
  XLSXStyle.writeFile(workbook, `Multas_TransPinho_${new Date().toISOString().split('T')[0]}.xlsx`);
}

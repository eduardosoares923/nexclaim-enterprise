import * as XLSX from 'xlsx';
import { Claim, ClaimStatus } from '../types';
import { normalizarTipoOcorrencia } from '../utils/textNormalization';

const NORMALIZAR = (s: any) => (s ?? '').toString().trim().toUpperCase();

const MAPA_STATUS: Record<string, ClaimStatus> = {
  'PENDENTE': 'Em análise',
  'SEGURO': 'Aguardando seguradora',
  'RESOLVIDO': 'Resolvido',
  'CANCELADO': 'Cancelado',
  'ENCERRADO': 'Encerrado',
};

function paraData(valor: any): string {
  if (!valor) return '';
  if (valor instanceof Date) return valor.toISOString().split('T')[0];
  if (typeof valor === 'number') {
    const data = XLSX.SSF.parse_date_code(valor);
    if (data) return `${data.y}-${String(data.m).padStart(2, '0')}-${String(data.d).padStart(2, '0')}`;
  }
  return String(valor).split(' ')[0];
}

function paraTexto(valor: any): string {
  if (valor === null || valor === undefined) return '';
  if (valor instanceof Date) {
    return `${String(valor.getDate()).padStart(2, '0')}/${String(valor.getMonth() + 1).padStart(2, '0')}/${valor.getFullYear()}`;
  }
  return String(valor).trim();
}

function normalizarCulpado(valor: string): string {
  if (!valor) return '';
  const v = NORMALIZAR(valor);
  if (v.includes('TERCEIRO')) return 'Terceiro';
  if (v.includes('MOTORISTA') || v.includes('TRANS PINHO') || v.includes('NOSSO')) return 'Motorista Trans Pinho';
  return valor;
}

function acharColuna(headers: string[], candidatos: string[]): number {
  for (const c of candidatos) {
    const idx = headers.findIndex((h) => NORMALIZAR(h) === NORMALIZAR(c));
    if (idx !== -1) return idx;
  }
  return -1;
}

export interface LinhaImportada {
  claim: Omit<Claim, 'id'>;
  aba: string;
  linhaOriginal: number;
}

export async function lerPlanilhaSinistros(file: File): Promise<LinhaImportada[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const resultado: LinhaImportada[] = [];

  workbook.SheetNames.forEach((nomeAba) => {
    if (NORMALIZAR(nomeAba) === 'DADOS') return;

    const sheet = workbook.Sheets[nomeAba];
    const linhas: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    if (linhas.length < 2) return;

    // A primeira linha costuma ser um título mesclado (ex: "SINISTROS"); os cabeçalhos reais
    // ficam na primeira linha que tiver "PLACA" em alguma célula.
    let indiceHeader = linhas.findIndex((linha) => linha.some((c) => NORMALIZAR(c) === 'PLACA'));
    if (indiceHeader === -1) return;

    const headers = linhas[indiceHeader].map((h) => (h ?? '').toString());
    const idx = {
      placa: acharColuna(headers, ['PLACA']),
      prefixo: acharColuna(headers, ['PREFIXO']),
      data: acharColuna(headers, ['DATA']),
      horario: acharColuna(headers, ['HORARIO', 'HORÁRIO']),
      motorista: acharColuna(headers, ['MOTORISTA']),
      tipo: acharColuna(headers, ['TIPO DE SINISTRO', 'TIPO']),
      supervisor: acharColuna(headers, ['SUPERVISOR']),
      ocorrido: acharColuna(headers, ['OCORRIDO']),
      carroEnvolvido: acharColuna(headers, ['CARRO ENVOLVIDO']),
      placa2: acharColuna(headers, ['PLACA2', 'PLACAS']),
      culpado: acharColuna(headers, ['CULPADO', 'RESPONSÁVEL', 'RESPONSAVEL']),
      situacao: acharColuna(headers, ['SITUAÇÃO', 'SITUACAO']),
      pagarCobrar: acharColuna(headers, ['PAGAR OU COBRAR']),
      custoEnvolvido: acharColuna(headers, ['CUSTO DO VEICULO DO ENVOLVIDO', 'CUSTO DO VEÍCULO DO ENVOLVIDO']),
      custoNosso: acharColuna(headers, ['CUSTO DO NOSSO VEICULO', 'CUSTO DO NOSSO VEÍCULO']),
      observacao: acharColuna(headers, ['OBSERVAÇÃO', 'OBSERVACAO', 'OBS']),
      quantoCobrar: acharColuna(headers, ['QUANTO COBRAR']),
      mesDesconto: acharColuna(headers, ['MÊS DA PRIMEIRO DESCONTO', 'MES DA PRIMEIRO DESCONTO']),
      cpfs: acharColuna(headers, ['CPFS', 'CPF']),
    };

    const pegar = (linha: any[], i: number) => (i === -1 ? undefined : linha[i]);
    const pegarNum = (linha: any[], i: number): number | undefined => {
      const v = pegar(linha, i);
      if (v === undefined || v === null || v === '') return undefined;
      const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d,.-]/g, '').replace(',', '.'));
      return isNaN(n) ? undefined : n;
    };

    for (let l = indiceHeader + 1; l < linhas.length; l++) {
      const linha = linhas[l];
      if (!linha || linha.every((c) => c === null || c === '')) continue;

      const placa = pegar(linha, idx.placa);
      const motorista = pegar(linha, idx.motorista);
      const ocorrido = pegar(linha, idx.ocorrido);
      const data = pegar(linha, idx.data);
      // Ignora linhas completamente vazias de conteúdo relevante
      if (!placa && !motorista && !ocorrido && !data) continue;

      const situacaoRaw = NORMALIZAR(pegar(linha, idx.situacao));
      const status: ClaimStatus = MAPA_STATUS[situacaoRaw] || 'Novo';

      const descricaoPartes = [paraTexto(ocorrido), paraTexto(pegar(linha, idx.observacao))].filter(Boolean);

      const custoTerceiro = pegarNum(linha, idx.custoEnvolvido);
      const custoNosso = pegarNum(linha, idx.custoNosso);
      const totalCalculado = (custoTerceiro || 0) + (custoNosso || 0);

      const claim: Omit<Claim, 'id'> = {
        claimNumber: `SIN-IMP-${nomeAba.replace(/\s+/g, '')}-${l}`,
        protocol: `PROT-IMP-${nomeAba.replace(/\s+/g, '')}-${l}`,
        occurrenceType: normalizarTipoOcorrencia(paraTexto(pegar(linha, idx.tipo))),
        date: paraData(data),
        time: paraTexto(pegar(linha, idx.horario)),
        occurrenceTime: paraTexto(pegar(linha, idx.horario)),
        location: '',
        city: 'Gravataí',
        state: 'RS',
        vehiclePlate: paraTexto(placa),
        vehiclePrefix: paraTexto(pegar(linha, idx.prefixo)),
        driverName: paraTexto(motorista),
        priority: 'Média',
        status,
        estimatedCost: custoNosso ?? 0,
        insurer: '',
        policyNumber: '',
        boNumber: '',
        description: descricaoPartes.join(' — ') || 'Importado de planilha, sem descrição detalhada.',
        supervisorName: paraTexto(pegar(linha, idx.supervisor)),
        thirdPartyVehicleDescription: paraTexto(pegar(linha, idx.carroEnvolvido)),
        thirdPartyPlate: paraTexto(pegar(linha, idx.placa2)),
        atFault: normalizarCulpado(paraTexto(pegar(linha, idx.culpado))),
        paymentDirection: (NORMALIZAR(pegar(linha, idx.pagarCobrar)) === 'PAGAR' ? 'Pagar' : NORMALIZAR(pegar(linha, idx.pagarCobrar)) === 'COBRAR' ? 'Cobrar' : ''),
        thirdPartyRepairCost: custoTerceiro,
        ownVehicleRepairCost: custoNosso,
        totalValue: totalCalculado > 0 ? totalCalculado : undefined,
        chargeAmount: pegarNum(linha, idx.quantoCobrar),
        firstDiscountMonth: paraTexto(pegar(linha, idx.mesDesconto)),
        thirdPartyDocument: paraTexto(pegar(linha, idx.cpfs)),
      };

      resultado.push({ claim, aba: nomeAba, linhaOriginal: l + 1 });
    }
  });

  return resultado;
}

export interface CadastroImportado {
  placa: string;
  prefixo: string;
  motorista: string;
  supervisor: string;
}

export interface SinistroDados {
  claim: Omit<Claim, 'id'>;
  linhaOriginal: number;
}

export interface ResultadoAbaDados {
  cadastros: CadastroImportado[];
  sinistros: SinistroDados[];
}

export async function lerAbaDados(file: File): Promise<ResultadoAbaDados | null> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const nomeAba = workbook.SheetNames.find((n) => NORMALIZAR(n) === 'DADOS');
  if (!nomeAba) return null;

  const sheet = workbook.Sheets[nomeAba];
  const linhas: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const indiceHeader = linhas.findIndex((linha) => linha.some((c) => NORMALIZAR(c) === 'PLACA'));
  if (indiceHeader === -1) return null;

  const headers = linhas[indiceHeader].map((h) => (h ?? '').toString());
  const idx = {
    placa: acharColuna(headers, ['PLACA']),
    prefixo: acharColuna(headers, ['PREFIXO']),
    situacao: acharColuna(headers, ['SITUAÇÃO', 'SITUACAO']),
    ocorrido: acharColuna(headers, ['OCORRIDO']),
    tipo: acharColuna(headers, ['TIPO DE SINISTRO']),
    vitima: acharColuna(headers, ['VITIMA', 'VÍTIMA']),
    carroOcorrencia: acharColuna(headers, ['CARRO DA OCORRENCIA', 'CARRO DA OCORRÊNCIA']),
    supervisor: acharColuna(headers, ['SUPERVISOR']),
    motorista: acharColuna(headers, ['MOTORISTA']),
    culpado: acharColuna(headers, ['CULPADO', 'RESPONSÁVEL', 'RESPONSAVEL']),
  };

  const pegar = (linha: any[], i: number) => (i === -1 ? undefined : linha[i]);
  const cadastros: CadastroImportado[] = [];
  const sinistros: SinistroDados[] = [];

  for (let l = indiceHeader + 1; l < linhas.length; l++) {
    const linha = linhas[l];
    if (!linha) continue;

    const placa = paraTexto(pegar(linha, idx.placa));
    const motorista = paraTexto(pegar(linha, idx.motorista));
    if (!placa && !motorista) continue;

    cadastros.push({
      placa,
      prefixo: paraTexto(pegar(linha, idx.prefixo)),
      motorista,
      supervisor: paraTexto(pegar(linha, idx.supervisor)),
    });

    const situacao = paraTexto(pegar(linha, idx.situacao));
    const ocorrido = paraTexto(pegar(linha, idx.ocorrido));
    const tipo = paraTexto(pegar(linha, idx.tipo));

    if (situacao || ocorrido || tipo) {
      const situacaoNorm = NORMALIZAR(situacao);
      const status: ClaimStatus =
        MAPA_STATUS[situacaoNorm] ||
        (situacaoNorm.includes('NÃO RESOLVID') || situacaoNorm.includes('NAO RESOLVID')
          ? 'Em análise'
          : situacaoNorm.includes('RESOLVID')
          ? 'Resolvido'
          : 'Novo');

      const vitima = paraTexto(pegar(linha, idx.vitima));
      const claim: Omit<Claim, 'id'> = {
        claimNumber: `SIN-IMP-DADOS-${l}`,
        protocol: `PROT-IMP-DADOS-${l}`,
        occurrenceType: normalizarTipoOcorrencia(tipo),
        date: '',
        time: '',
        location: '',
        city: 'Gravataí',
        state: 'RS',
        vehiclePlate: placa,
        vehiclePrefix: paraTexto(pegar(linha, idx.prefixo)),
        driverName: motorista,
        priority: 'Média',
        status,
        estimatedCost: 0,
        insurer: '',
        policyNumber: '',
        boNumber: '',
        description: [ocorrido, vitima && `Vítima: ${vitima}`].filter(Boolean).join(' — ') || 'Importado da aba DADOS.',
        supervisorName: paraTexto(pegar(linha, idx.supervisor)),
        thirdPartyVehicleDescription: paraTexto(pegar(linha, idx.carroOcorrencia)),
        atFault: normalizarCulpado(paraTexto(pegar(linha, idx.culpado))),
      };

      sinistros.push({ claim, linhaOriginal: l + 1 });
    }
  }

  return { cadastros, sinistros };
}

import * as XLSX from 'xlsx';
// @ts-ignore
import * as XLSXStyle from 'xlsx-js-style';
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
  if (valor instanceof Date) {
    // Usa os componentes locais para não deslocar o dia por causa do fuso horário
    const a = valor.getFullYear();
    const m = String(valor.getMonth() + 1).padStart(2, '0');
    const d = String(valor.getDate()).padStart(2, '0');
    return `${a}-${m}-${d}`;
  }
  if (typeof valor === 'number') {
    const data = XLSX.SSF.parse_date_code(valor);
    if (data) return `${data.y}-${String(data.m).padStart(2, '0')}-${String(data.d).padStart(2, '0')}`;
    return '';
  }

  const texto = String(valor).trim().split(' ')[0];

  // Já no formato AAAA-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) return texto.slice(0, 10);

  // DD/MM/AAAA ou D/M/AAAA
  const br = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`;

  // DDMM/AAAA (barra no lugar errado, ex: "2509/2026")
  const colado = texto.match(/^(\d{2})(\d{2})\/(\d{4})$/);
  if (colado) return `${colado[3]}-${colado[2]}-${colado[1]}`;

  // Não deu pra entender: devolve vazio em vez de gravar texto quebrado
  return '';
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
  avisos?: string[];
}

const PLACEHOLDER_TEXTO = /^(-+|SEM\s+IN[FM]ORMA[CÇ][AÃ]O|SEM\s+PLACA|N\/?I|N[AÃ]O\s+INFORMADO)$/;

/** Devolve o texto, ou vazio se for só um marcador tipo "-" ou "SEM INFORMAÇÃO". */
function valorUtil(valor: string): string {
  const t = (valor || '').trim();
  if (!t) return '';
  return PLACEHOLDER_TEXTO.test(NORMALIZAR(t)) ? '' : t;
}

/** Traduz a coluna SITUAÇÃO (com erros de digitação) para o status do sistema. */
export function mapearSituacao(bruto: string): { status: ClaimStatus; advogado: boolean } {
  const n = NORMALIZAR(bruto).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!n) return { status: 'Em análise', advogado: false };
  if (/ADV[OA]GAD/.test(n)) return { status: 'Em análise', advogado: true };
  if (/RESOLV/.test(n)) return { status: 'Resolvido', advogado: false };
  if (/CANCEL/.test(n)) return { status: 'Cancelado', advogado: false };
  if (/ENCERR/.test(n)) return { status: 'Encerrado', advogado: false };
  if (/SE?G+URO/.test(n)) return { status: 'Aguardando seguradora', advogado: false };
  if (/ASSINATURA|DOCUMENT/.test(n)) return { status: 'Aguardando documentos', advogado: false };
  return { status: MAPA_STATUS[NORMALIZAR(bruto)] || 'Em análise', advogado: false };
}

/**
 * Chave que identifica um sinistro pelo conteúdo. Com placa, usa placa + data (não depende do
 * nome do motorista, que tem muito erro de digitação entre as abas). Sem placa, usa data +
 * motorista + começo do texto do ocorrido.
 */
export function chaveSinistro(c: {
  vehiclePlate?: string;
  date?: string;
  driverName?: string;
  description?: string;
}): string {
  const placa = (c.vehiclePlate || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (placa) return `${placa}|${c.date || ''}`;
  const motorista = (c.driverName || '').trim().toUpperCase().replace(/\s+/g, ' ');
  const ocorrido = (c.description || '').toUpperCase().replace(/\s+/g, ' ').trim().slice(0, 30);
  return `|${c.date || ''}|${motorista}|${ocorrido}`;
}

/**
 * Escolhe quais abas vêm marcadas por padrão. Se existe uma aba consolidada do ano
 * (ex: "2026") que já contém todas as linhas de uma aba mensal, a mensal fica desmarcada
 * pra não duplicar, e a consolidada fica marcada (ela costuma ser a mais completa).
 */
export function escolherAbasIniciais(linhas: LinhaImportada[]): Set<string> {
  const porAba = new Map<string, LinhaImportada[]>();
  linhas.forEach((l) => {
    const lista = porAba.get(l.aba) || [];
    lista.push(l);
    porAba.set(l.aba, lista);
  });

  const nome = (a: string) => a.trim().toUpperCase();
  const consolidadas = Array.from(porAba.keys()).filter((a) => /^\d{4}$/.test(nome(a)));
  const cobertas = new Set<string>();

  consolidadas.forEach((cons) => {
    const chaves = new Set((porAba.get(cons) || []).map((l) => chaveSinistro(l.claim)));
    porAba.forEach((lista, aba) => {
      if (aba === cons || consolidadas.includes(aba)) return;
      if (lista.length > 0 && lista.every((l) => chaves.has(chaveSinistro(l.claim)))) cobertas.add(aba);
    });
  });

  const selecionadas = new Set<string>();
  porAba.forEach((_, aba) => {
    const n = nome(aba);
    if (n === 'DADOS' || n === 'RESUMO') return;
    if (cobertas.has(aba)) return;
    // Aba em que nenhuma linha tem data não parece registro de sinistro (ex: lista de apoio)
    const lista = porAba.get(aba) || [];
    if (lista.length > 0 && lista.every((l) => !l.claim.date)) return;
    selecionadas.add(aba);
  });
  return selecionadas;
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
      carroEnvolvido2: acharColuna(headers, ['CARRO ENVOLVIDO2']),
      placaCarro2: acharColuna(headers, ['PLACA CARRO 2']),
      bo: acharColuna(headers, ['B.O', 'B.O.', 'BO', 'NUMERO DO B.O', 'Nº B.O']),
      valorTotal: acharColuna(headers, ['VALOR TOTAL']),
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

      const avisos: string[] = [];

      const situacaoTexto = paraTexto(pegar(linha, idx.situacao));
      const { status, advogado } = mapearSituacao(situacaoTexto);

      const descricaoPartes = [paraTexto(ocorrido), paraTexto(pegar(linha, idx.observacao))].filter(Boolean);

      const custoTerceiro = pegarNum(linha, idx.custoEnvolvido);
      const custoNosso = pegarNum(linha, idx.custoNosso);
      const somaCustos = (custoTerceiro || 0) + (custoNosso || 0);
      const valorTotalPlanilha = pegarNum(linha, idx.valorTotal);
      const totalFinal = valorTotalPlanilha && valorTotalPlanilha > 0 ? valorTotalPlanilha : somaCustos;

      // Data: avisa quando não dá pra aproveitar
      const dataFinal = paraData(data);
      if (!dataFinal) {
        avisos.push(
          data
            ? `Data não reconhecida ("${paraTexto(data)}"), ficou em branco.`
            : 'Linha sem data.'
        );
      }

      // Pagar ou cobrar: só aceita os dois valores certos
      const pagarCobrarTexto = NORMALIZAR(pegar(linha, idx.pagarCobrar));
      let direcao: '' | 'Pagar' | 'Cobrar' = '';
      if (pagarCobrarTexto === 'PAGAR') direcao = 'Pagar';
      else if (pagarCobrarTexto === 'COBRAR') direcao = 'Cobrar';
      else if (pagarCobrarTexto && pagarCobrarTexto !== '-') {
        avisos.push(`"Pagar ou cobrar" com valor não reconhecido ("${pagarCobrarTexto}"), ficou em branco.`);
      }

      // Terceiros: a coluna "CARRO ENVOLVIDO2" costuma ser usada pra digitar a placa do 1º terceiro.
      const carro1 = valorUtil(paraTexto(pegar(linha, idx.carroEnvolvido)));
      const placaNormal = valorUtil(paraTexto(pegar(linha, idx.placa2)));
      const carro2Coluna = valorUtil(paraTexto(pegar(linha, idx.carroEnvolvido2)));
      const placaCarro2 = valorUtil(paraTexto(pegar(linha, idx.placaCarro2)));
      const cpfTerceiro = paraTexto(pegar(linha, idx.cpfs));

      const terceiros: { vehicleDescription: string; plate: string; document?: string }[] = [];
      if (placaCarro2) {
        // Linha com dois terceiros: cada carro tem descrição e placa próprias
        terceiros.push({ vehicleDescription: carro1, plate: placaNormal, document: cpfTerceiro });
        terceiros.push({ vehicleDescription: carro2Coluna, plate: placaCarro2, document: '' });
      } else {
        terceiros.push({
          vehicleDescription: carro1,
          plate: placaNormal || carro2Coluna,
          document: cpfTerceiro,
        });
      }
      const terceirosUteis = terceiros.filter((t) => t.vehicleDescription || t.plate || t.document);
      const primeiro = terceirosUteis[0];

      const claim: Omit<Claim, 'id'> = {
        claimNumber: `SIN-IMP-${nomeAba.replace(/\s+/g, '')}-${l}`,
        protocol: `PROT-IMP-${nomeAba.replace(/\s+/g, '')}-${l}`,
        occurrenceType: normalizarTipoOcorrencia(paraTexto(pegar(linha, idx.tipo))),
        date: dataFinal,
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
        boNumber: paraTexto(pegar(linha, idx.bo)),
        description: descricaoPartes.join(' — ') || 'Importado de planilha, sem descrição detalhada.',
        supervisorName: paraTexto(pegar(linha, idx.supervisor)),
        thirdParties: terceirosUteis,
        thirdPartyVehicleDescription: primeiro?.vehicleDescription || '',
        thirdPartyPlate: primeiro?.plate || '',
        thirdPartyDocument: primeiro?.document || '',
        atFault: normalizarCulpado(paraTexto(pegar(linha, idx.culpado))),
        paymentDirection: direcao,
        thirdPartyRepairCost: custoTerceiro,
        ownVehicleRepairCost: custoNosso,
        totalValue: totalFinal > 0 ? totalFinal : undefined,
        chargeAmount: pegarNum(linha, idx.quantoCobrar),
        firstDiscountMonth: paraTexto(pegar(linha, idx.mesDesconto)),
        checklistStatus: situacaoTexto || undefined,
        enviarAdvogado: advogado || undefined,
      };

      resultado.push({ claim, aba: nomeAba, linhaOriginal: l + 1, avisos });
    }
  });

  return resultado;
}

export interface PlanoImportacao {
  /** Sinistros que ainda não existem no sistema: serão criados */
  novas: LinhaImportada[];
  /** Sinistros que já existem no sistema: podem ser completados com os dados que faltam */
  existentes: { linha: LinhaImportada; claimId: string }[];
  /** Linhas repetidas em outra aba desta mesma planilha: ignoradas */
  repetidasEntreAbas: LinhaImportada[];
}

/**
 * Separa as linhas marcadas em: novas, já cadastradas e repetidas entre abas.
 * Abas consolidadas (ex: "2026") entram primeiro, porque costumam ter as colunas mais completas.
 * Linhas repetidas DENTRO da mesma aba são mantidas (são registros distintos da planilha).
 */
export function planejarImportacao(
  selecionadas: LinhaImportada[],
  existentes: { id: string; vehiclePlate?: string; date?: string; driverName?: string; description?: string }[]
): PlanoImportacao {
  const ehConsolidada = (aba: string) => /^\d{4}$/.test(aba.trim());
  const ordenadas = [
    ...selecionadas.filter((l) => ehConsolidada(l.aba)),
    ...selecionadas.filter((l) => !ehConsolidada(l.aba)),
  ];

  const noBanco = new Map<string, string>();
  existentes.forEach((c) => {
    const chave = chaveSinistro(c);
    if (!noBanco.has(chave)) noBanco.set(chave, c.id);
  });

  const vistaEmAba = new Map<string, string>();
  const plano: PlanoImportacao = { novas: [], existentes: [], repetidasEntreAbas: [] };

  ordenadas.forEach((linha) => {
    const chave = chaveSinistro(linha.claim);
    const abaAnterior = vistaEmAba.get(chave);
    if (abaAnterior !== undefined && abaAnterior !== linha.aba) {
      plano.repetidasEntreAbas.push(linha);
      return;
    }
    if (abaAnterior === undefined) vistaEmAba.set(chave, linha.aba);

    const idNoBanco = noBanco.get(chave);
    if (idNoBanco) plano.existentes.push({ linha, claimId: idNoBanco });
    else plano.novas.push(linha);
  });

  return plano;
}

const CAMPOS_COMPLETAVEIS = [
  'boNumber',
  'supervisorName',
  'vehiclePrefix',
  'time',
  'atFault',
  'paymentDirection',
  'thirdPartyRepairCost',
  'ownVehicleRepairCost',
  'totalValue',
  'chargeAmount',
  'firstDiscountMonth',
  'checklistStatus',
  'thirdPartyVehicleDescription',
  'thirdPartyPlate',
  'thirdPartyDocument',
  'thirdParties',
  'enviarAdvogado',
] as const;

/**
 * Devolve só os campos que estão VAZIOS no sinistro já cadastrado e que a planilha traz preenchidos.
 * Nunca sobrescreve o que já está preenchido (nem o status, que pode ter mudado no sistema).
 */
export function camposQueFaltam(existente: Partial<Claim>, novo: Omit<Claim, 'id'>): Partial<Claim> {
  const vazio = (v: any) =>
    v === undefined || v === null || v === '' || v === 0 || v === false || (Array.isArray(v) && v.length === 0);
  const patch: Record<string, any> = {};
  CAMPOS_COMPLETAVEIS.forEach((campo) => {
    const atual = (existente as any)[campo];
    const vindo = (novo as any)[campo];
    if (vazio(atual) && !vazio(vindo)) patch[campo] = vindo;
  });
  return patch as Partial<Claim>;
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
          : 'Em análise');

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

export interface ColunaExportacao {
  chave: string;
  rotulo: string;
  tipo?: 'moeda';
  obterValor?: (c: any) => any;
}

export const COLUNAS_EXPORTACAO_SINISTROS: ColunaExportacao[] = [
  { chave: 'claimNumber', rotulo: 'Nº Sinistro' },
  { chave: 'protocol', rotulo: 'Protocolo' },
  { chave: 'vehiclePlate', rotulo: 'Placa' },
  { chave: 'vehiclePrefix', rotulo: 'Prefixo' },
  { chave: 'date', rotulo: 'Data' },
  { chave: 'time', rotulo: 'Horário' },
  { chave: 'driverName', rotulo: 'Motorista' },
  { chave: 'occurrenceType', rotulo: 'Tipo de Sinistro' },
  { chave: 'supervisorName', rotulo: 'Supervisor' },
  { chave: 'description', rotulo: 'Ocorrido' },
  { chave: 'thirdPartyVehicleDescription', rotulo: 'Carro Envolvido' },
  { chave: 'thirdPartyPlate', rotulo: 'Placa do Terceiro' },
  { chave: 'thirdPartyName', rotulo: 'Nome do Responsável Envolvido' },
  { chave: 'thirdPartyDocument', rotulo: 'CPF do Terceiro' },
  { chave: 'atFault', rotulo: 'Culpado' },
  { chave: 'status', rotulo: 'Situação' },
  { chave: 'caseDetail', rotulo: 'Detalhamento do Caso' },
  { chave: 'paymentDirection', rotulo: 'Pagar ou Cobrar' },
  { chave: 'thirdPartyRepairCost', rotulo: 'Custo do Terceiro', tipo: 'moeda' },
  { chave: 'ownVehicleRepairCost', rotulo: 'Custo do Nosso Veículo', tipo: 'moeda' },
  { chave: 'totalValue', rotulo: 'Valor Total', tipo: 'moeda' },
  { chave: 'priority', rotulo: 'Prioridade' },
  { chave: 'boNumber', rotulo: 'Nº B.O.' },
  { chave: 'checklistStatus', rotulo: 'Status Checklist' },
  { chave: 'cnhMotorista', rotulo: 'CNH Motorista', obterValor: (c) => (c.documentChecklist?.cnhMotorista ? 'TEM' : 'NÃO TEM') },
  { chave: 'cnhTerceiro', rotulo: 'CNH Terceiro', obterValor: (c) => (c.documentChecklist?.cnhTerceiro ? 'TEM' : 'NÃO TEM') },
  { chave: 'crlvProprio', rotulo: 'CRLV Nosso', obterValor: (c) => (c.documentChecklist?.crlvProprio ? 'TEM' : 'NÃO TEM') },
  { chave: 'crlvTerceiro', rotulo: 'CRLV Terceiro', obterValor: (c) => (c.documentChecklist?.crlvTerceiro ? 'TEM' : 'NÃO TEM') },
  { chave: 'croqui', rotulo: 'Croqui', obterValor: (c) => (c.documentChecklist?.croqui ? 'TEM' : 'NÃO TEM') },
  { chave: 'fotosChecklist', rotulo: 'Fotos (Checklist)', obterValor: (c) => (c.documentChecklist?.fotos ? 'TEM' : 'NÃO TEM') },
  { chave: 'lit', rotulo: 'L.I.T', obterValor: (c) => (c.documentChecklist?.lit ? 'TEM' : 'NÃO TEM') },
  { chave: 'orcamentosChecklist', rotulo: 'Orçamentos (Checklist)', obterValor: (c) => (c.documentChecklist?.orcamentos ? 'TEM' : 'NÃO TEM') },
  { chave: 'videoChecklist', rotulo: 'Vídeo', obterValor: (c) => (c.documentChecklist?.video ? 'TEM' : 'NÃO TEM') },
  { chave: 'termoChecklist', rotulo: 'Termo (Checklist)', obterValor: (c) => (c.documentChecklist?.termo ? 'TEM' : 'NÃO TEM') },
  { chave: 'checklistObs', rotulo: 'Obs. Checklist' },
];

export function exportarSinistrosParaExcel(claims: Claim[], colunasChaves: string[]) {
  const colunas = COLUNAS_EXPORTACAO_SINISTROS.filter((c) => colunasChaves.includes(c.chave));
  if (colunas.length === 0) return;

  const TITULO = 'Relatório de Sinistros — Trans Pinho';
  const dataGeracao = new Date().toLocaleDateString('pt-BR');

  const linhasDados = claims.map((c: any) =>
    colunas.map((col) => (col.obterValor ? col.obterValor(c) : c[col.chave] ?? ''))
  );

  const aoa: any[][] = [
    [TITULO],
    [`Gerado em ${dataGeracao} — ${claims.length} sinistro(s)`],
    [],
    colunas.map((c) => c.rotulo),
    ...linhasDados,
  ];

  const worksheet = XLSXStyle.utils.aoa_to_sheet(aoa);

  const LINHA_CABECALHO = 3; // índice 0-based da linha com os rótulos das colunas
  const LINHA_PRIMEIRO_DADO = 4;

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: colunas.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: colunas.length - 1 } },
  ];

  worksheet['!cols'] = colunas.map((col) => {
    const maior = Math.max(
      col.rotulo.length,
      ...claims.map((c: any) => String(col.obterValor ? col.obterValor(c) : c[col.chave] ?? '').length)
    );
    return { wch: Math.min(Math.max(maior + 2, 10), 40) };
  });
  worksheet['!freeze'] = { xSplit: 0, ySplit: LINHA_CABECALHO + 1 };
  worksheet['!autofilter'] = { ref: XLSXStyle.utils.encode_range({ s: { r: LINHA_CABECALHO, c: 0 }, e: { r: LINHA_CABECALHO, c: colunas.length - 1 } }) };

  const enderecar = (r: number, c: number) => XLSXStyle.utils.encode_cell({ r, c });

  if (worksheet[enderecar(0, 0)]) {
    worksheet[enderecar(0, 0)].s = {
      font: { bold: true, sz: 14, color: { rgb: '1E293B' } },
      alignment: { horizontal: 'left' },
    };
  }
  if (worksheet[enderecar(1, 0)]) {
    worksheet[enderecar(1, 0)].s = {
      font: { italic: true, sz: 10, color: { rgb: '64748B' } },
    };
  }

  const bordaFina = { style: 'thin', color: { rgb: 'E2E8F0' } };

  colunas.forEach((col, c) => {
    const enderecoCab = enderecar(LINHA_CABECALHO, c);
    if (worksheet[enderecoCab]) {
      worksheet[enderecoCab].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1E293B' } },
        alignment: { vertical: 'center', horizontal: 'left' },
        border: { top: bordaFina, bottom: bordaFina, left: bordaFina, right: bordaFina },
      };
    }

    claims.forEach((_, i) => {
      const r = LINHA_PRIMEIRO_DADO + i;
      const endereco = enderecar(r, c);
      if (!worksheet[endereco]) return;

      const zebra = i % 2 === 1 ? 'F8FAFC' : 'FFFFFF';
      const estilo: any = {
        fill: { fgColor: { rgb: zebra } },
        border: { top: bordaFina, bottom: bordaFina, left: bordaFina, right: bordaFina },
        alignment: { vertical: 'center' },
      };

      if (col.tipo === 'moeda' && typeof worksheet[endereco].v === 'number') {
        estilo.numFmt = '"R$" #,##0.00';
        estilo.alignment.horizontal = 'right';
      }

      worksheet[endereco].s = estilo;
    });
  });

  const workbook = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Sinistros');

  const dataArquivo = new Date().toISOString().split('T')[0];
  XLSXStyle.writeFile(workbook, `Sinistros_TransPinho_${dataArquivo}.xlsx`);
}

export interface LinhaStatusImportada {
  placa: string;
  atualizacao: Partial<Claim>;
}

/**
 * Lê a aba "STATUS" da planilha (o checklist de documentação por sinistro) e
 * devolve, por placa, os campos do checklist a atualizar no sinistro já
 * cadastrado. Não cria sinistro novo, só atualiza o que já existe.
 */
export async function lerPlanilhaStatus(file: File): Promise<LinhaStatusImportada[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const nomeAba = workbook.SheetNames.find((n) => n.trim().toUpperCase() === 'STATUS');
  if (!nomeAba) {
    throw new Error('Não encontrei uma aba chamada "STATUS" nessa planilha.');
  }

  const linhas: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[nomeAba], { header: 1, defval: null });
  const indiceHeader = linhas.findIndex((linha) =>
    (linha || []).some((c) => (c ?? '').toString().trim().toUpperCase() === 'VEICULO')
  );
  if (indiceHeader === -1) {
    throw new Error('Não encontrei a coluna "VEICULO" na aba STATUS.');
  }

  const headers = linhas[indiceHeader].map((h) => (h ?? '').toString());
  const idx = {
    status: acharColuna(headers, ['STATUS']),
    veiculo: acharColuna(headers, ['VEICULO', 'VEÍCULO']),
    cnhMotorista: acharColuna(headers, ['CNH DO MOTORISTA']),
    cnhTerceiro: acharColuna(headers, ['CNH DO TERCEIRO']),
    crlvProprio: acharColuna(headers, ['CRVL DO NOSSO VEICULO', 'CRLV DO NOSSO VEICULO']),
    crlvTerceiro: acharColuna(headers, ['CRVL DO CARRO ENVOLVIDO', 'CRLV DO CARRO ENVOLVIDO']),
    croqui: acharColuna(headers, ['CROQUI']),
    fotos: acharColuna(headers, ['FOTOS']),
    lit: acharColuna(headers, ['L.I.T', 'LIT']),
    orcamentos: acharColuna(headers, ['ORÇAMNTOS', 'ORÇAMENTOS', 'ORCAMENTOS']),
    video: acharColuna(headers, ['VIDEO', 'VÍDEO']),
    termo: acharColuna(headers, ['TERMO']),
    obs: acharColuna(headers, ['OBS', 'OBSERVAÇÃO', 'OBSERVACAO']),
  };

  const pegar = (linha: any[], i: number) => (i === -1 ? undefined : linha[i]);
  const tem = (valor: any) => paraTexto(valor).trim().toUpperCase() === 'TEM';

  const resultado: LinhaStatusImportada[] = [];

  for (let l = indiceHeader + 1; l < linhas.length; l++) {
    const linha = linhas[l];
    if (!linha) continue;

    const placa = paraTexto(pegar(linha, idx.veiculo)).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!placa) continue;

    resultado.push({
      placa,
      atualizacao: {
        checklistStatus: paraTexto(pegar(linha, idx.status)) || undefined,
        checklistObs: paraTexto(pegar(linha, idx.obs)) || undefined,
        documentChecklist: {
          cnhMotorista: tem(pegar(linha, idx.cnhMotorista)),
          cnhTerceiro: tem(pegar(linha, idx.cnhTerceiro)),
          crlvProprio: tem(pegar(linha, idx.crlvProprio)),
          crlvTerceiro: tem(pegar(linha, idx.crlvTerceiro)),
          croqui: tem(pegar(linha, idx.croqui)),
          fotos: tem(pegar(linha, idx.fotos)),
          lit: tem(pegar(linha, idx.lit)),
          orcamentos: tem(pegar(linha, idx.orcamentos)),
          video: tem(pegar(linha, idx.video)),
          termo: tem(pegar(linha, idx.termo)),
        },
      },
    });
  }

  if (resultado.length === 0) {
    throw new Error('Nenhuma linha válida encontrada na aba STATUS.');
  }

  return resultado;
}

export interface LinhaAdvogadoImportada {
  placa: string;
  atualizacao: Partial<Claim>;
}

/**
 * Lê a aba "TERCEIRO NÃO QUEREM PAGAR" e devolve, por placa, os dados a
 * atualizar no sinistro já cadastrado, marcando-o para o advogado.
 */
export async function lerPlanilhaAdvogado(file: File): Promise<LinhaAdvogadoImportada[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const nomeAba = workbook.SheetNames.find((n) =>
    n.trim().toUpperCase().includes('TERCEIRO') && n.trim().toUpperCase().includes('PAGAR')
  );
  if (!nomeAba) {
    throw new Error('Não encontrei a aba "TERCEIRO NÃO QUEREM PAGAR" nessa planilha.');
  }

  const linhas: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[nomeAba], { header: 1, defval: null });
  const indiceHeader = linhas.findIndex((linha) =>
    (linha || []).some((c) => (c ?? '').toString().trim().toUpperCase() === 'CARRO')
  );
  if (indiceHeader === -1) {
    throw new Error('Não encontrei a coluna "CARRO" nessa aba.');
  }

  const headers = linhas[indiceHeader].map((h) => (h ?? '').toString());
  const idx = {
    carro: acharColuna(headers, ['CARRO']),
    nomeTerceiro: acharColuna(headers, ['NOME DO TERCEIRO']),
    numeroTerceiro: acharColuna(headers, ['NUMERO DO TERCEIRO']),
    contato: acharColuna(headers, ['CONTATO COM O TERCERIO', 'CONTATO COM O TERCEIRO']),
    orcamento1: acharColuna(headers, ['ORÇAMENTO 1 (CALGAROTO)']),
    orcamento2: acharColuna(headers, ['ORÇAMENTO 2 (JONES REPAROS)']),
    orcamento3: acharColuna(headers, ['ORÇAMENTO 3 (CHAPEAÇÃO)']),
    notaFiscal: acharColuna(headers, ['NOTAS FICAIS', 'NOTAS FISCAIS']),
    consertado: acharColuna(headers, ['CONSERTADO']),
    testemunha: acharColuna(headers, ['TESTEMUNHA']),
    obs: acharColuna(headers, ['OBS']),
  };

  const pegar = (linha: any[], i: number) => (i === -1 ? undefined : linha[i]);
  const resultado: LinhaAdvogadoImportada[] = [];

  for (let l = indiceHeader + 1; l < linhas.length; l++) {
    const linha = linhas[l];
    if (!linha) continue;

    const placa = paraTexto(pegar(linha, idx.carro)).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!placa) continue;

    const contato = paraTexto(pegar(linha, idx.contato));
    const nomeTerceiro = paraTexto(pegar(linha, idx.nomeTerceiro));
    const testemunha = paraTexto(pegar(linha, idx.testemunha));
    const obsPlanilha = paraTexto(pegar(linha, idx.obs));

    const orcamentosTem = [
      paraTexto(pegar(linha, idx.orcamento1)).toUpperCase() === 'TEM' ? 'Calgaroto' : null,
      paraTexto(pegar(linha, idx.orcamento2)).toUpperCase() === 'TEM' ? 'Jones Reparos' : null,
      paraTexto(pegar(linha, idx.orcamento3)).toUpperCase() === 'TEM' ? 'Chapeação' : null,
    ].filter(Boolean);

    const partesObs = [
      `Contato com o terceiro: ${contato || 'não informado'}`,
      orcamentosTem.length > 0 ? `Orçamentos recebidos: ${orcamentosTem.join(', ')}` : 'Nenhum orçamento recebido ainda',
      paraTexto(pegar(linha, idx.notaFiscal)).toUpperCase() === 'TEM' ? 'Nota fiscal: recebida' : 'Nota fiscal: pendente',
      paraTexto(pegar(linha, idx.consertado)).toUpperCase() === 'SIM' ? 'Veículo já consertado' : 'Veículo ainda não consertado',
      testemunha ? `Testemunha: ${testemunha}` : '',
      obsPlanilha,
    ].filter(Boolean);

    resultado.push({
      placa,
      atualizacao: {
        enviarAdvogado: true,
        advogadoStatus: contato ? `Contato ${contato.toLowerCase()}` : undefined,
        advogadoObs: partesObs.join(' • '),
        thirdPartyName: nomeTerceiro || undefined,
        thirdPartyPhone: paraTexto(pegar(linha, idx.numeroTerceiro)) || undefined,
      },
    });
  }

  if (resultado.length === 0) {
    throw new Error('Nenhuma linha válida encontrada na aba "TERCEIRO NÃO QUEREM PAGAR".');
  }

  return resultado;
}


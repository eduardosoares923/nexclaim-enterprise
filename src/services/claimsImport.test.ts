import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import {
  lerPlanilhaSinistros,
  mapearSituacao,
  chaveSinistro,
  escolherAbasIniciais,
  planejarImportacao,
  camposQueFaltam,
  LinhaImportada,
} from './claimsImport';

const linha = (aba: string, claim: any): LinhaImportada => ({ aba, linhaOriginal: 3, claim });

async function arquivoComAba(nomeAba: string, linhas: any[][]): Promise<File> {
  const ws = XLSX.utils.aoa_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nomeAba);
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new File([buf], 'teste.xlsx');
}

describe('mapearSituacao', () => {
  it('reconhece resolvido mesmo com erro de digitação', () => {
    expect(mapearSituacao('RESOLVIDO').status).toBe('Resolvido');
    expect(mapearSituacao('RESOLVIO').status).toBe('Resolvido');
    expect(mapearSituacao('RESOLVOD').status).toBe('Resolvido');
  });
  it('reconhece seguro com erro de digitação', () => {
    expect(mapearSituacao('SEGGURO TERCEIRO').status).toBe('Aguardando seguradora');
    expect(mapearSituacao('SEGURO').status).toBe('Aguardando seguradora');
  });
  it('marca advogado, inclusive escrito errado', () => {
    expect(mapearSituacao('ADVOGADO').advogado).toBe(true);
    expect(mapearSituacao('ADVAGADO').advogado).toBe(true);
    expect(mapearSituacao('PENDENTE').advogado).toBe(false);
  });
  it('usa Em análise quando não reconhece', () => {
    expect(mapearSituacao('PEDENTE').status).toBe('Em análise');
    expect(mapearSituacao('').status).toBe('Em análise');
  });
});

describe('chaveSinistro', () => {
  it('ignora o nome do motorista quando há placa (typos entre abas)', () => {
    const a = chaveSinistro({ vehiclePlate: 'TQQ-6H24', date: '2026-07-03', driverName: 'MARCELO TEIXIERA' });
    const b = chaveSinistro({ vehiclePlate: 'TQQ6H24', date: '2026-07-03', driverName: 'MARCELO TEIXEIRA' });
    expect(a).toBe(b);
  });
  it('sem placa, diferencia sinistros pelo texto do ocorrido', () => {
    const a = chaveSinistro({ date: '2026-01-10', driverName: 'ANA', description: 'VIDRO QUEBRADO' });
    const b = chaveSinistro({ date: '2026-01-10', driverName: 'ANA', description: 'RETROVISOR QUEBRADO' });
    expect(a).not.toBe(b);
  });
});

describe('lerPlanilhaSinistros', () => {
  const cab = ['PLACA', 'PREFIXO', 'DATA', 'MOTORISTA', 'OCORRIDO', 'CARRO ENVOLVIDO', 'PLACA2', 'CARRO ENVOLVIDO2', 'PLACA CARRO 2', 'B.O', 'SITUAÇÃO', 'VALOR TOTAL', 'PAGAR OU COBRAR'];

  it('conserta data com barra no lugar errado e avisa quando não há data', async () => {
    const f = await arquivoComAba('2026', [
      ['SINISTROS'],
      cab,
      ['AAA1B23', '1', '2509/2026', 'JOAO', 'bateu', '', '', '', '', '', '', '', ''],
      ['AAA1B24', '2', '', 'MARIA', 'raspou', '', '', '', '', '', '', '', ''],
    ]);
    const r = await lerPlanilhaSinistros(f);
    expect(r[0].claim.date).toBe('2026-09-25');
    expect(r[1].claim.date).toBe('');
    expect(r[1].avisos?.join(' ')).toContain('sem data');
  });

  it('lê B.O, placa digitada em CARRO ENVOLVIDO2 e ignora placeholders', async () => {
    const f = await arquivoComAba('2026', [
      ['SINISTROS'],
      cab,
      ['AAA1B23', '1', '2026-08-01', 'JOAO', 'bateu', 'Gol', '', 'SWK2C10', '', '202609011686417', 'PENDENTE', '', ''],
      ['AAA1B24', '2', '2026-08-02', 'MARIA', 'raspou', 'Uno', '', 'SEM INFORMAÇÃO', '', '', 'PENDENTE', '', ''],
    ]);
    const r = await lerPlanilhaSinistros(f);
    expect(r[0].claim.boNumber).toBe('202609011686417');
    expect(r[0].claim.thirdPartyPlate).toBe('SWK2C10');
    expect(r[1].claim.thirdPartyPlate).toBe('');
  });

  it('lê dois terceiros quando há PLACA CARRO 2', async () => {
    const f = await arquivoComAba('2026', [
      ['SINISTROS'],
      cab,
      ['AAA1B23', '1', '2026-09-01', 'JOAO', 'bateu', 'I30', 'IRW6J24', 'STRADA', 'ISC0995', '', '', '', ''],
    ]);
    const r = await lerPlanilhaSinistros(f);
    const t = r[0].claim.thirdParties!;
    expect(t).toHaveLength(2);
    expect(t[0]).toMatchObject({ vehicleDescription: 'I30', plate: 'IRW6J24' });
    expect(t[1]).toMatchObject({ vehicleDescription: 'STRADA', plate: 'ISC0995' });
  });

  it('usa VALOR TOTAL da planilha e não aceita "PEGAR" como pagar', async () => {
    const f = await arquivoComAba('2026', [
      ['SINISTROS'],
      cab,
      ['AAA1B23', '1', '2026-08-01', 'JOAO', 'bateu', '', '', '', '', '', '', 500, 'PEGAR'],
    ]);
    const r = await lerPlanilhaSinistros(f);
    expect(r[0].claim.totalValue).toBe(500);
    expect(r[0].claim.paymentDirection).toBe('');
    expect(r[0].avisos?.join(' ')).toContain('PEGAR');
  });
});

describe('escolherAbasIniciais', () => {
  const c = (placa: string, date: string) => ({ vehiclePlate: placa, date, driverName: 'X', description: 'y' });

  it('marca a consolidada e desmarca a mensal que ela já cobre', () => {
    const linhas = [
      linha('2026', c('AAA1A11', '2026-01-02')),
      linha('2026', c('BBB2B22', '2026-02-03')),
      linha('Janeiro 26', c('AAA1A11', '2026-01-02')),
    ];
    const sel = escolherAbasIniciais(linhas);
    expect(sel.has('2026')).toBe(true);
    expect(sel.has('Janeiro 26')).toBe(false);
  });

  it('mantém marcada a mensal que tem linha que a consolidada não tem', () => {
    const linhas = [
      linha('2026', c('AAA1A11', '2026-07-01')),
      linha('Julho 26', c('AAA1A11', '2026-07-01')),
      linha('Julho 26', c('CCC3C33', '2026-07-03')),
    ];
    expect(escolherAbasIniciais(linhas).has('Julho 26')).toBe(true);
  });

  it('desmarca aba em que nenhuma linha tem data', () => {
    const linhas = [linha('Planilha3', c('AAA1A11', '')), linha('Planilha3', c('BBB2B22', ''))];
    expect(escolherAbasIniciais(linhas).has('Planilha3')).toBe(false);
  });
});

describe('planejarImportacao', () => {
  const c = (placa: string, date: string) => ({ vehiclePlate: placa, date, driverName: 'X', description: 'y' });

  it('não duplica o que já existe no sistema nem o que repete entre abas', () => {
    const linhas = [
      linha('2026', c('AAA1A11', '2026-01-02')),
      linha('2026', c('BBB2B22', '2026-02-03')),
      linha('Janeiro 26', c('AAA1A11', '2026-01-02')),
    ];
    const plano = planejarImportacao(linhas, [{ id: 'db1', ...c('AAA1A11', '2026-01-02') }]);
    expect(plano.novas).toHaveLength(1);
    expect(plano.existentes).toHaveLength(1);
    expect(plano.repetidasEntreAbas).toHaveLength(1);
  });

  it('mantém linhas repetidas dentro da mesma aba', () => {
    const linhas = [linha('2026', c('AAA1A11', '2026-09-08')), linha('2026', c('AAA1A11', '2026-09-08'))];
    expect(planejarImportacao(linhas, []).novas).toHaveLength(2);
  });

  it('importar de novo a mesma planilha não cria nada', () => {
    const linhas = [linha('2026', c('AAA1A11', '2026-01-02'))];
    const primeira = planejarImportacao(linhas, []);
    const banco = primeira.novas.map((l, i) => ({ id: 'n' + i, ...l.claim }));
    expect(planejarImportacao(linhas, banco).novas).toHaveLength(0);
  });
});

describe('camposQueFaltam', () => {
  it('só preenche o que está vazio e nunca sobrescreve', () => {
    const existente = { boNumber: '', supervisorName: 'ARTUR', thirdParties: [], status: 'Resolvido' } as any;
    const novo = { boNumber: '123', supervisorName: 'OUTRO', thirdParties: [{ plate: 'AAA1A11' }], status: 'Em análise' } as any;
    const patch: any = camposQueFaltam(existente, novo);
    expect(patch.boNumber).toBe('123');
    expect(patch.thirdParties).toHaveLength(1);
    expect(patch.supervisorName).toBeUndefined();
    expect(patch.status).toBeUndefined();
  });
});

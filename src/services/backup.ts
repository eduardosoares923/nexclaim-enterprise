import { saveAs } from 'file-saver';
import { firebaseService } from './firebase';

export interface BackupCompleto {
  versao: string;
  geradoEm: string;
  geradoPor: string;
  dados: {
    claims: any[];
    fines: any[];
    terms: any[];
    vehicles: any[];
    people: any[];
    workOrders: any[];
    financialEntries: any[];
    infractionTypes: any[];
    documentTemplates: any[];
  };
}

/** Baixa um arquivo com TODOS os dados do sistema. */
export async function gerarBackupCompleto(usuario: string): Promise<number> {
  const [
    claims, fines, terms, vehicles, people,
    workOrders, financialEntries, infractionTypes, documentTemplates,
  ] = await Promise.all([
    firebaseService.fetchClaims(),
    firebaseService.fetchFines(),
    firebaseService.fetchTerms(),
    firebaseService.fetchVehicles(),
    firebaseService.fetchPeople(),
    firebaseService.fetchWorkOrders(),
    firebaseService.fetchFinancialEntries(),
    firebaseService.fetchInfractionTypes(),
    firebaseService.fetchTemplates(),
  ]);

  const backup: BackupCompleto = {
    versao: '1.0',
    geradoEm: new Date().toISOString(),
    geradoPor: usuario,
    dados: {
      claims, fines, terms, vehicles, people,
      workOrders, financialEntries, infractionTypes, documentTemplates,
    },
  };

  const total = Object.values(backup.dados).reduce((soma, lista) => soma + lista.length, 0);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const data = new Date().toISOString().split('T')[0];
  saveAs(blob, `backup-nexclaim-${data}.json`);
  return total;
}

/** Lê um arquivo de backup e devolve o conteúdo, validando o formato. */
export async function lerArquivoBackup(file: File): Promise<BackupCompleto> {
  const texto = await file.text();
  let backup: BackupCompleto;
  try {
    backup = JSON.parse(texto);
  } catch {
    throw new Error('Esse arquivo não é um backup válido do sistema.');
  }
  if (!backup?.dados || typeof backup.dados !== 'object') {
    throw new Error('Esse arquivo não tem a estrutura de um backup do sistema.');
  }
  return backup;
}

/** Restaura os registros de um backup, criando os que não existem mais. */
export async function restaurarBackup(
  backup: BackupCompleto,
  aoProgredir?: (feitos: number, total: number) => void
): Promise<{ restaurados: number; ignorados: number }> {
  const mapa: [keyof BackupCompleto['dados'], (d: any) => Promise<string>][] = [
    ['vehicles', (d) => firebaseService.saveVehicle(d)],
    ['people', (d) => firebaseService.savePerson(d)],
    ['infractionTypes', (d) => firebaseService.saveInfractionType(d)],
    ['documentTemplates', (d) => firebaseService.saveTemplate(d)],
    ['claims', (d) => firebaseService.saveClaim(d)],
    ['fines', (d) => firebaseService.saveFine(d)],
    ['terms', (d) => firebaseService.saveTerm(d)],
    ['workOrders', (d) => firebaseService.saveWorkOrder(d)],
    ['financialEntries', (d) => firebaseService.saveFinancialEntry(d)],
  ];

  const total = mapa.reduce((s, [chave]) => s + (backup.dados[chave]?.length || 0), 0);
  let feitos = 0;
  let restaurados = 0;
  let ignorados = 0;

  for (const [chave, salvar] of mapa) {
    for (const registro of backup.dados[chave] || []) {
      const { id, ...dados } = registro;
      try {
        await salvar(dados);
        restaurados += 1;
      } catch {
        ignorados += 1;
      }
      feitos += 1;
      aoProgredir?.(feitos, total);
    }
  }

  return { restaurados, ignorados };
}

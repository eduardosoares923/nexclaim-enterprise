/* ==========================================================================
   NexClaim Enterprise - Firebase Integration (TypeScript Module)
   ========================================================================== */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { deleteDoc } from '@firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Claim, Fine, Term, DocumentTemplate, Person, Vehicle, InfractionType, FinancialEntry } from '../types';
import { WorkOrder } from '../views/WorkOrdersView';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';

// Configuração do Worker do PDF.js bundled
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

// User's Real Firebase Project Credentials
export const firebaseConfig = {
  apiKey: "AIzaSyDasXOq68r06XACOv56BeBprL80uvJY4xo",
  authDomain: "nexclaim-enterprise.firebaseapp.com",
  projectId: "nexclaim-enterprise",
  storageBucket: "nexclaim-enterprise.firebasestorage.app",
  messagingSenderId: "794701731378",
  appId: "1:794701731378:web:96e52a2dd018a568464e2b"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Remove campos undefined para evitar erros no Firestore
 */
function removeUndefinedFields<T extends Record<string, any>>(obj: T): T {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
}

// Firestore Realtime Collections API Services
export const firebaseService = {
  // Sync Claims
  async fetchClaims(): Promise<Claim[]> {
    try {
      const snap = await getDocs(collection(db, 'claims'));
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Claim));
      }
    } catch (e) {
      console.warn('Firestore fetchClaims fallback:', e);
    }
    return [];
  },

  async saveClaim(claimData: Omit<Claim, 'id'>): Promise<string> {
    try {
      const dadosComCriador = { ...claimData, createdBy: auth.currentUser?.email || null };
      const docRef = await addDoc(collection(db, 'claims'), removeUndefinedFields(dadosComCriador));
      return docRef.id;
    } catch (e) {
      console.error('Firestore saveClaim error:', e);
      return `claim-${Date.now()}`;
    }
  },

  async updateClaim(id: string, data: Partial<Claim>): Promise<void> {
    try {
      await updateDoc(doc(db, 'claims', id), removeUndefinedFields(data));
    } catch (e) {
      console.error('Firestore updateClaim error:', e);
    }
  },

  async deleteClaim(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'claims', id));
    } catch (e) {
      console.error('Firestore deleteClaim error:', e);
    }
  },

  // Sync Fines
  async fetchFines(): Promise<Fine[]> {
    try {
      const snap = await getDocs(collection(db, 'fines'));
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Fine));
      }
    } catch (e) {
      console.warn('Firestore fetchFines fallback:', e);
    }
    return [];
  },

  async saveFine(fineData: Omit<Fine, 'id'>): Promise<string> {
    try {
      const dadosComCriador = { ...fineData, createdBy: auth.currentUser?.email || null };
      const docRef = await addDoc(collection(db, 'fines'), removeUndefinedFields(dadosComCriador));
      return docRef.id;
    } catch (e) {
      console.error('Firestore saveFine error:', e);
      return `fine-${Date.now()}`;
    }
  },

  async updateFine(id: string, data: Partial<Fine>): Promise<void> {
    try {
      await updateDoc(doc(db, 'fines', id), removeUndefinedFields(data));
    } catch (e) {
      console.error('Firestore updateFine error:', e);
    }
  },

  async deleteFine(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'fines', id));
    } catch (e) {
      console.error('Firestore deleteFine error:', e);
    }
  },

  // Sync Infraction Types
  async fetchInfractionTypes(): Promise<InfractionType[]> {
    try {
      const snap = await getDocs(collection(db, 'infractionTypes'));
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as InfractionType));
      }
    } catch (e) {
      console.warn('Firestore fetchInfractionTypes fallback:', e);
    }
    return [];
  },

  async saveInfractionType(data: Omit<InfractionType, 'id'>): Promise<string> {
    try {
      const dadosComCriador = { ...data, createdBy: auth.currentUser?.email || null };
      const docRef = await addDoc(collection(db, 'infractionTypes'), removeUndefinedFields(dadosComCriador));
      return docRef.id;
    } catch (e) {
      console.error('Firestore saveInfractionType error:', e);
      return `inf-${Date.now()}`;
    }
  },

  async updateInfractionType(id: string, data: Partial<InfractionType>): Promise<void> {
    try {
      await updateDoc(doc(db, 'infractionTypes', id), removeUndefinedFields(data));
    } catch (e) {
      console.error('Firestore updateInfractionType error:', e);
    }
  },

  async deleteInfractionType(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'infractionTypes', id));
    } catch (e) {
      console.error('Firestore deleteInfractionType error:', e);
    }
  },

  // Sync Terms
  async fetchTerms(): Promise<Term[]> {
    try {
      const snap = await getDocs(collection(db, 'terms'));
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Term));
      }
    } catch (e) {
      console.warn('Firestore fetchTerms fallback:', e);
    }
    return [];
  },

  async saveTerm(termData: Omit<Term, 'id'>): Promise<string> {
    try {
      const dadosComCriador = { ...termData, createdBy: auth.currentUser?.email || null };
      const docRef = await addDoc(collection(db, 'terms'), removeUndefinedFields(dadosComCriador));
      return docRef.id;
    } catch (e) {
      console.error('Firestore saveTerm error:', e);
      return `trm-${Date.now()}`;
    }
  },

  async updateTerm(id: string, data: Partial<Term>): Promise<void> {
    try {
      await updateDoc(doc(db, 'terms', id), removeUndefinedFields(data));
    } catch (e) {
      console.error('Firestore updateTerm error:', e);
      throw e;
    }
  },

  async deleteTerm(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'terms', id));
    } catch (e) {
      console.error('Firestore deleteTerm error:', e);
    }
  },

  // Sync Vehicles
  async fetchVehicles(): Promise<Vehicle[]> {
    try {
      const snap = await getDocs(collection(db, 'vehicles'));
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Vehicle));
      }
    } catch (e) {
      console.warn('Firestore fetchVehicles fallback:', e);
    }
    return [];
  },

  async saveVehicle(vehicleData: Omit<Vehicle, 'id'>): Promise<string> {
    try {
      const dadosComCriador = { ...vehicleData, createdBy: auth.currentUser?.email || null };
      const docRef = await addDoc(collection(db, 'vehicles'), removeUndefinedFields(dadosComCriador));
      return docRef.id;
    } catch (e) {
      console.error('Firestore saveVehicle error:', e);
      return `veh-${Date.now()}`;
    }
  },

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
    try {
      await updateDoc(doc(db, 'vehicles', id), removeUndefinedFields(data));
    } catch (e) {
      console.error('Firestore updateVehicle error:', e);
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'vehicles', id));
    } catch (e) {
      console.error('Firestore deleteVehicle error:', e);
    }
  },

  // Sync People
  async fetchPeople(): Promise<Person[]> {
    try {
      const snap = await getDocs(collection(db, 'people'));
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Person));
      }
    } catch (e) {
      console.warn('Firestore fetchPeople fallback:', e);
    }
    return [];
  },

  async savePerson(personData: Omit<Person, 'id'>): Promise<string> {
    try {
      const dadosComCriador = { ...personData, createdBy: auth.currentUser?.email || null };
      const docRef = await addDoc(collection(db, 'people'), removeUndefinedFields(dadosComCriador));
      return docRef.id;
    } catch (e) {
      console.error('Firestore savePerson error:', e);
      return `peo-${Date.now()}`;
    }
  },

  async updatePerson(id: string, data: Partial<Person>): Promise<void> {
    try {
      await updateDoc(doc(db, 'people', id), removeUndefinedFields(data));
    } catch (e) {
      console.error('Firestore updatePerson error:', e);
    }
  },

  async deletePerson(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'people', id));
    } catch (e) {
      console.error('Firestore deletePerson error:', e);
      throw e;
    }
  },

  // Sync Work Orders (OS & Orçamentos)
  async fetchWorkOrders(): Promise<WorkOrder[]> {
    try {
      const snap = await getDocs(collection(db, 'workOrders'));
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as WorkOrder));
      }
      return [];
    } catch (e) {
      console.error('Firestore fetchWorkOrders error:', e);
      throw e;
    }
  },

  async saveWorkOrder(data: Omit<WorkOrder, 'id'>): Promise<string> {
    try {
      const dadosComCriador = { ...data, createdBy: auth.currentUser?.email || null };
      const docRef = await addDoc(collection(db, 'workOrders'), removeUndefinedFields(dadosComCriador));
      return docRef.id;
    } catch (e) {
      console.error('Firestore saveWorkOrder error:', e);
      throw e;
    }
  },

  async updateWorkOrder(id: string, data: Partial<WorkOrder>): Promise<void> {
    try {
      await updateDoc(doc(db, 'workOrders', id), removeUndefinedFields(data));
    } catch (e) {
      console.error('Firestore updateWorkOrder error:', e);
      throw e;
    }
  },

  async deleteWorkOrder(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'workOrders', id));
    } catch (e) {
      console.error('Firestore deleteWorkOrder error:', e);
      throw e;
    }
  },

  // Sync Financial Entries (Módulo Financeiro)
  async fetchFinancialEntries(): Promise<FinancialEntry[]> {
    try {
      const snap = await getDocs(collection(db, 'financialEntries'));
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as FinancialEntry));
      }
      return [];
    } catch (e) {
      console.error('Firestore fetchFinancialEntries error:', e);
      return [];
    }
  },

  async saveFinancialEntry(data: Omit<FinancialEntry, 'id'>): Promise<string> {
    try {
      const dadosComCriador = { ...data, createdBy: auth.currentUser?.email || null };
      const docRef = await addDoc(collection(db, 'financialEntries'), removeUndefinedFields(dadosComCriador));
      return docRef.id;
    } catch (e) {
      console.error('Firestore saveFinancialEntry error:', e);
      throw e;
    }
  },

  async updateFinancialEntry(id: string, data: Partial<FinancialEntry>): Promise<void> {
    try {
      await updateDoc(doc(db, 'financialEntries', id), removeUndefinedFields(data));
    } catch (e) {
      console.error('Firestore updateFinancialEntry error:', e);
      throw e;
    }
  },

  async deleteFinancialEntry(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'financialEntries', id));
    } catch (e) {
      console.error('Firestore deleteFinancialEntry error:', e);
      throw e;
    }
  },

  // Cloud Storage File Upload
  async uploadFile(file: File, folder: string = 'documents'): Promise<string> {
    try {
      const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (e) {
      console.error('Firebase Storage Upload error:', e);
      return '';
    }
  }
};

/**
 * Autenticação via Email e Senha
 */
export async function loginComEmailSenha(
  email: string,
  senha: string
): Promise<{ ok: boolean; erro?: string }> {
  try {
    await signInWithEmailAndPassword(auth, email, senha);
    return { ok: true };
  } catch (error: any) {
    console.error('Erro de login no Firebase Auth:', error);
    let mensagemAmigavel = 'Erro ao realizar login. Verifique suas credenciais.';

    switch (error?.code) {
      case 'auth/invalid-credential':
        mensagemAmigavel = 'E-mail ou senha incorretos.';
        break;
      case 'auth/wrong-password':
        mensagemAmigavel = 'Senha incorreta. Verifique e tente novamente.';
        break;
      case 'auth/user-not-found':
        mensagemAmigavel = 'Usuário não encontrado com este e-mail.';
        break;
      case 'auth/too-many-requests':
        mensagemAmigavel = 'Muitas tentativas sem sucesso. Tente novamente mais tarde.';
        break;
      case 'auth/invalid-email':
        mensagemAmigavel = 'Formato de e-mail inválido.';
        break;
      default:
        if (error?.message) {
          mensagemAmigavel = error.message;
        }
        break;
    }

    return { ok: false, erro: mensagemAmigavel };
  }
}

/**
 * Logout do Firebase Auth
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Observar mudanças no estado de autenticação
 */
export function observarAutenticacao(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Extração de texto de PDFs (Orçamentos de Oficina / Vistoria)
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Tempo esgotado ao carregar o PDF (mais de 20 segundos). Tente novamente ou use um arquivo menor.')), 20000)
      ),
    ]);
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Agrupa itens por linha baseado na posição vertical Y (com tolerância de 3px)
      const linesMap = new Map<number, Array<{ x: number; str: string }>>();

      for (const item of textContent.items as any[]) {
        if (item.str === undefined || !item.str.trim()) continue;
        const y = Math.round(item.transform[5]);
        const x = item.transform[4];

        let foundY = y;
        for (const existingY of linesMap.keys()) {
          if (Math.abs(existingY - y) <= 3) {
            foundY = existingY;
            break;
          }
        }

        if (!linesMap.has(foundY)) {
          linesMap.set(foundY, []);
        }
        linesMap.get(foundY)!.push({ x, str: item.str });
      }

      // Ordena as linhas de cima para baixo (Y decrescente no PDF)
      const sortedYs = Array.from(linesMap.keys()).sort((a, b) => b - a);
      const pageLines: string[] = [];

      for (const y of sortedYs) {
        // Ordena itens da linha da esquerda para a direita (X crescente)
        const lineItems = linesMap.get(y)!.sort((a, b) => a.x - b.x);
        const lineText = lineItems.map((it) => it.str).join(' ').trim();
        if (lineText) {
          pageLines.push(lineText);
        }
      }

      const pageText = pageLines.length > 0
        ? pageLines.join('\n')
        : textContent.items.map((item: any) => (item.str !== undefined ? item.str : '')).join(' ');

      fullText += (pageNum > 1 ? '\n\n' : '') + `--- [Página ${pageNum} de ${pdf.numPages}] ---\n` + pageText;
    }

    const textoReal = fullText.replace(/---\s*\[Página.*?\]\s*---/g, '').trim();
    if (!textoReal) {
      throw new Error('Não foi possível extrair texto deste PDF. Ele pode ser uma imagem escaneada sem camada de texto.');
    }

    return fullText.trim();
  } catch (error: any) {
    console.error('Erro ao extrair texto do PDF com pdfjs-dist:', error);
    throw new Error(`Falha ao ler o arquivo PDF: ${error?.message || error}`);
  }
}

/**
 * Extração de itens a partir do layout de orçamento de fornecedor
 */
export function extrairItensDoTexto(texto: string): Array<{ description: string; quantity: number; unitPrice: number }> {
  const linhas = texto.split('\n');
  const itens: Array<{ description: string; quantity: number; unitPrice: number }> = [];

  const paraNumero = (s: string) => parseFloat(s.replace(/\./g, '').replace(',', '.'));

  // Formato: <item#> <código> <descrição...> UN <quantidade>,00 <valor unit>,XX <desconto>,XX <total>,XX
  const regexLinhaProduto = /^(\d{1,3})\s+(\d{1,6}(?:\s+\d{2,4})?|\d{1,6})\s+(.+?)\s+UN\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/;

  linhas.forEach((linhaRaw) => {
    const linha = linhaRaw.trim();
    const match = linha.match(regexLinhaProduto);
    if (!match) return;

    const [, , , descricaoBruta, quantidadeStr, valorUnitStr] = match;

    const descricao = descricaoBruta.replace(/\s*-\s*$/, '').trim();
    const quantidade = paraNumero(quantidadeStr);
    const valorUnitario = paraNumero(valorUnitStr);

    if (!descricao || descricao.length < 3 || !quantidade || !valorUnitario) return;

    itens.push({
      description: descricao.slice(0, 120),
      quantity: quantidade,
      unitPrice: valorUnitario,
    });
  });

  return itens;
}

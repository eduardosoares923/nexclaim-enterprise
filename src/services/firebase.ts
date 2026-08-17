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
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Claim, Fine, Term, DocumentTemplate, Person, Vehicle } from '../types';

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
      const docRef = await addDoc(collection(db, 'claims'), claimData);
      return docRef.id;
    } catch (e) {
      console.error('Firestore saveClaim error:', e);
      return `claim-${Date.now()}`;
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
      const docRef = await addDoc(collection(db, 'fines'), fineData);
      return docRef.id;
    } catch (e) {
      console.error('Firestore saveFine error:', e);
      return `fine-${Date.now()}`;
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
      const docRef = await addDoc(collection(db, 'terms'), termData);
      return docRef.id;
    } catch (e) {
      console.error('Firestore saveTerm error:', e);
      return `trm-${Date.now()}`;
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


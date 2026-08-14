/* ==========================================================================
   NexClaim Enterprise - Firebase Integration (TypeScript Module)
   ========================================================================== */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
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
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Claim));
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
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Fine));
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
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Term));
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

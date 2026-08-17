/// <reference types="vite/client" />

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    [key: string]: any;
  }
  export function getAuth(app?: any): any;
  export class GoogleAuthProvider {
    constructor();
  }
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export function onAuthStateChanged(auth: any, nextOrObserver: (user: User | null) => void): () => void;
}

declare module 'firebase/app' {
  export function initializeApp(config: any): any;
  export function getApps(): any[];
  export function getApp(name?: string): any;
}

declare module 'firebase/firestore' {
  export function getFirestore(app?: any): any;
  export function collection(firestore: any, path: string, ...pathSegments: string[]): any;
  export function getDocs(query: any): Promise<any>;
  export function addDoc(reference: any, data: any): Promise<any>;
  export function updateDoc(reference: any, ...fieldsAndValues: any[]): Promise<any>;
  export function doc(firestore: any, path: string, ...pathSegments: string[]): any;
  export function setDoc(reference: any, data: any, options?: any): Promise<any>;
}

declare module 'firebase/storage' {
  export function getStorage(app?: any): any;
  export function ref(storage: any, url?: string): any;
  export function uploadBytes(ref: any, data: any, metadata?: any): Promise<any>;
  export function getDownloadURL(ref: any): Promise<string>;
}

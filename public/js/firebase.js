import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Firebase Configuration Provided by User
export const firebaseConfig = {
  apiKey: "AIzaSyDasXOq68r06XACOv56BeBprL80uvJY4xo",
  authDomain: "nexclaim-enterprise.firebaseapp.com",
  projectId: "nexclaim-enterprise",
  storageBucket: "nexclaim-enterprise.firebasestorage.app",
  messagingSenderId: "794701731378",
  appId: "1:794701731378:web:96e52a2dd018a568464e2b"
};

// Initialize Firebase App & Services
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Autenticação via Email e Senha
 */
export async function loginComEmailSenha(email, senha) {
  try {
    await signInWithEmailAndPassword(auth, email, senha);
    return { ok: true };
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    let mensagem = "Erro ao realizar login. Verifique suas credenciais.";

    switch (error?.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        mensagem = "E-mail ou senha incorretos.";
        break;
      case "auth/user-not-found":
        mensagem = "Usuário não encontrado com este e-mail.";
        break;
      case "auth/too-many-requests":
        mensagem = "Muitas tentativas sem sucesso. Tente novamente mais tarde.";
        break;
      case "auth/invalid-email":
        mensagem = "Formato de e-mail inválido.";
        break;
      default:
        mensagem = "Erro ao realizar login. Verifique suas credenciais.";
        break;
    }

    return { ok: false, erro: mensagem };
  }
}

/**
 * Logout do usuário
 */
export async function logoutUsuario() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro no logout:", error);
  }
}

/**
 * Observador de estado da sessão
 */
export function observarAutenticacao(callback) {
  return onAuthStateChanged(auth, callback);
}

// Expor no objeto global window para scripts legados / não-módulos (ex: app.js)
window.nexclaimAuth = {
  loginComEmailSenha,
  logoutUsuario,
  observarAutenticacao,
  auth,
  db,
  storage
};

console.log("🔥 Firebase NexClaim Enterprise Initialized Successfully!");

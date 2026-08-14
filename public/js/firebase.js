/* ==========================================================================
   NexClaim Enterprise - Firebase Integration (Live Configuration)
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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

console.log("🔥 Firebase NexClaim Enterprise Initialized Successfully!");

import { FIREBASE_API_KEY } from './firebase-secrets';

export const environment = {
  production: true,

  // ✅ FIXED: Pointing to the active Python Engine
  apiUrl: 'https://obrioxia-engine.onrender.com',

  firebase: {
    apiKey: FIREBASE_API_KEY,
    authDomain: "obrioxia-audit-engine.firebaseapp.com",
    projectId: "obrioxia-audit-engine",
    storageBucket: "obrioxia-audit-engine.firebasestorage.app",
    messagingSenderId: "233336301606",
    appId: "1:233336301606:web:6a6305d2226511ddc61ee7"
  }
};

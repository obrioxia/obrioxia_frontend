export const environment = {
  production: true,

  // ✅ FIXED: Pointing to the active Python Engine
  apiUrl: 'https://obrioxia-engine.onrender.com',

  // SECURITY: Admin API key must never be in the client bundle
  apiKey: '',

  firebase: {
    apiKey: "AIzaSyDuhcvj5JS_8bCtF5K6i3DlVlEuYEKMDuM",
    authDomain: "obrioxia-audit-engine.firebaseapp.com",
    projectId: "obrioxia-audit-engine",
    storageBucket: "obrioxia-audit-engine.firebasestorage.app",
    messagingSenderId: "233336301606",
    appId: "1:233336301606:web:6a6305d2226511ddc61ee7"
  }
};

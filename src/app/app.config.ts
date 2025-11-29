import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { routes } from './app.routes';

// HARDCODED CONFIGURATION (Bypasses environment file issues)
const firebaseConfig = {
  apiKey: "AIzaSyDuhvcjJS_8bCtF5Ki3D1VLpUEyEKMDuM",
  authDomain: "obrioxia-audit-engine.firebaseapp.com",
  projectId: "obrioxia-audit-engine",
  storageBucket: "obrioxia-audit-engine.appspot.com",
  messagingSenderId: "23333631066",
  appId: "1:23333631066:web:6a6305d2226511ddc61ee7"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Initialize directly with the const above
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
};

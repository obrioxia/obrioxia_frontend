import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { routes } from './app.routes';

// DIRECT COPY FROM FIREBASE CONSOLE (Exact Match)
const firebaseConfig = {
  apiKey: "AIzaSyDuhcvj5JS_8bCtF5K6i3DlVlEuYEKMDuM",
  authDomain: "obrioxia-audit-engine.firebaseapp.com",
  projectId: "obrioxia-audit-engine",
  storageBucket: "obrioxia-audit-engine.firebasestorage.app",
  messagingSenderId: "233336301606",
  appId: "1:233336301606:web:6a6305d2226511ddc61ee7"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
};

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { routes } from './app.routes';

// HARDCODED CONFIGURATION (Corrected Typo: Alza -> AIza)
const firebaseConfig = {
  // FIXED: Changed first letter from 'l' (lowercase L) to 'I' (Capital i)
  apiKey: "AIzaSyDuhvcj5JS_8bCtF5K6i3DIVlEuYEKMdUM",
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
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
};

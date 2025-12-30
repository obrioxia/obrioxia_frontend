import { ApplicationConfig, importProvidersFrom } from '@angular/core'; // ✅ Added importProvidersFrom
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // ✅ Added FormsModule
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { routes } from './app.routes';

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
    importProvidersFrom(FormsModule), // ✅ Fixes the "ngModel" build error globally
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
};

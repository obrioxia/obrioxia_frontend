import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// --- NEW IMPORTS ---
// We need these modules to handle forms and HTTP requests
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // --- NEW PROVIDERS ---
    // Add these to the providers array
    importProvidersFrom(FormsModule),
    importProvidersFrom(HttpClientModule)
  ]
};

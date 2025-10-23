import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // <-- We changed 'App' to 'AppComponent' here

bootstrapApplication(AppComponent, appConfig) // <-- And here
  .catch((err) => console.error(err));

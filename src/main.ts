import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

console.log("------------------------------------------------");
console.log("SYSTEM STARTUP v3.5.10 (KEY TYPO FIXED)");
console.log("------------------------------------------------");

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error("CRITICAL STARTUP ERROR:", err));

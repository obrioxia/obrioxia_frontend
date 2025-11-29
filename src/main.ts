import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// CACHE BREAKER LOG
console.log("------------------------------------------------");
console.log("SYSTEM STARTUP v3.5.8");
console.log("LOADING CONFIG...");
// This line forces the file hash to change, breaking the cache
console.log("------------------------------------------------");

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error("CRITICAL STARTUP ERROR:", err));

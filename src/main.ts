import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    // EMERGENCY ERROR LOGGER
    // This catches the "Black Screen" crash and prints it visibly
    console.error("CRITICAL STARTUP ERROR:", err);
    
    document.body.innerHTML = `
      <div style="background:black; color:#ff5555; padding:40px; font-family:monospace; font-size: 14px; white-space:pre-wrap;">
        <h1 style="color:white; font-size:24px; margin-bottom:20px;">⚠️ SYSTEM CRASH</h1>
        <h3 style="border-bottom: 1px solid #333; padding-bottom:10px;">${err.message || err}</h3>
        <pre style="color:#aaa;">${err.stack || 'No stack trace available.'}</pre>
      </div>
    `;
  });

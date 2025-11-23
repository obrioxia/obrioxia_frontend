import { Routes } from '@angular/router';
import { SubmitComponent } from './submit/submit.component';
import { IncidentsComponent } from './incidents/incidents.component';
import { LogsComponent } from './logs/logs.component';

export const routes: Routes = [
  { path: '', redirectTo: 'submit', pathMatch: 'full' },
  
  // Core Routes
  { path: 'submit', component: SubmitComponent },
  { path: 'incidents', component: IncidentsComponent },
  { path: 'logs', component: LogsComponent },
  
  // The New Verify Route (Lazy Loaded)
  { 
    path: 'verify', 
    loadComponent: () => import('./public-verify/public-verify.component').then(m => m.PublicVerifyComponent) 
  },

  // Fallback (must be last)
  { path: '**', redirectTo: 'submit' }
];

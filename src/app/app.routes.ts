import { Routes } from '@angular/router';
import { demoAccessGuard } from './guards/demo-access.guard'; 

// Components
import { SubmitComponent } from './submit/submit.component';
import { PublicVerifyComponent } from './public-verify/public-verify.component';
import { AuditLedgerComponent } from './pages/audit-ledger/audit-ledger.component'; 
import { AccessGateComponent } from './pages/access-gate/access-gate.component';   

export const routes: Routes = [
  // 1. The Public Gate (Unprotected)
  // 👇 CHANGED 'access-denied' TO 'demo-gate' TO MATCH YOUR GUARD
  { path: 'demo-gate', component: AccessGateComponent },

  // 2. Protected Routes (Wrapped in Guard)
  { 
    path: '', 
    canActivate: [demoAccessGuard], // 🔒 Checks for 'demo_key' in localStorage
    children: [
      // If they pass the guard, default to the 'log' page
      { path: '', redirectTo: 'log', pathMatch: 'full' },
      
      // The 3 Core Tools
      { path: 'log', component: SubmitComponent },
      { path: 'verify', component: PublicVerifyComponent },
      { path: 'ledger', component: AuditLedgerComponent }
    ]
  },

  // Catch-all: Send lost users back to root
  // (Root triggers the Guard -> Guard checks key -> Sends to Demo Gate if missing)
  { path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';
import { demoAccessGuard } from './guards/demo-access.guard'; // Updated guard import

// Components
import { SubmitComponent } from './submit/submit.component';
import { PublicVerifyComponent } from './public-verify/public-verify.component';
import { AuditLedgerComponent } from './pages/audit-ledger/audit-ledger.component'; // New Component
import { AccessGateComponent } from './pages/access-gate/access-gate.component';   // New Component

export const routes: Routes = [
  // 1. The Public Gate (No Guard)
  { path: 'access-denied', component: AccessGateComponent },

  // 2. Protected Routes (Wrapped in Guard)
  { 
    path: '', 
    canActivate: [demoAccessGuard],
    children: [
      { path: '', redirectTo: 'log', pathMatch: 'full' },
      
      // The 3 Core Tools
      { path: 'log', component: SubmitComponent },
      { path: 'verify', component: PublicVerifyComponent },
      { path: 'ledger', component: AuditLedgerComponent }
    ]
  },

  // Catch-all: Send lost users back to root (which triggers the guard)
  { path: '**', redirectTo: '' }
];

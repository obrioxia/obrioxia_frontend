import { Routes } from '@angular/router';
import { demoAccessGuard } from './guards/demo-access.guard';
import { SubmitComponent } from './submit/submit.component';
import { PublicVerifyComponent } from './public-verify/public-verify.component';
import { AuditLedgerComponent } from './pages/audit-ledger/audit-ledger.component';
import { AccessGateComponent } from './pages/access-gate/access-gate.component';

export const routes: Routes = [
  // 1. The Gate (MUST be first and NO Guard)
  { 
    path: 'demo-gate', 
    component: AccessGateComponent 
  },

  // 2. The Protected App
  {
    path: '',
    canActivate: [demoAccessGuard], // The Bouncer is only here
    children: [
      { path: '', redirectTo: 'log', pathMatch: 'full' },
      { path: 'log', component: SubmitComponent },
      { path: 'verify', component: PublicVerifyComponent },
      { path: 'ledger', component: AuditLedgerComponent }
    ]
  },

  // 3. Catch-All (The Loop Breaker)
  // If the user gets lost, send them to the GATE, not the root.
  { path: '**', redirectTo: 'demo-gate' }
];

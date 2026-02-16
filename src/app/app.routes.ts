import { Routes } from '@angular/router';
import { demoAccessGuard } from './guards/demo-access.guard';
import { SubmitComponent } from './submit/submit.component';
import { PublicVerifyComponent } from './public-verify/public-verify.component';
import { AuditLedgerComponent } from './pages/audit-ledger/audit-ledger.component';
import { AccessGateComponent } from './pages/access-gate/access-gate.component';
import { TermsComponent } from './legal/terms.component';
import { PrivacyComponent } from './legal/privacy.component';
import { DisclaimerComponent } from './legal/disclaimer.component';

export const routes: Routes = [
  // 1. The Gate: Public entry point (No Guard)
  {
    path: 'demo-gate',
    component: AccessGateComponent
  },

  // 2. The Protected App: Requires demo-key validation via demoAccessGuard
  {
    path: '',
    canActivate: [demoAccessGuard], // Protects all children
    children: [
      { path: '', redirectTo: 'log', pathMatch: 'full' },
      { path: 'log', component: SubmitComponent },
      { path: 'verify', component: PublicVerifyComponent },
      { path: 'ledger', component: AuditLedgerComponent },
      { path: 'terms', component: TermsComponent },
      { path: 'privacy', component: PrivacyComponent },
      { path: 'data-disclaimer', component: DisclaimerComponent }
    ]
  },

  // 3. Catch-All: Redirects any unknown URL back to the Gate to prevent dead ends
  { path: '**', redirectTo: 'demo-gate' }
];

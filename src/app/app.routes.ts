import { Routes } from '@angular/router';
import { SubmitComponent } from './submit/submit.component';
import { PublicVerifyComponent } from './public-verify/public-verify.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { TermsComponent } from './legal/terms.component';
import { PrivacyComponent } from './legal/privacy.component';
import { DisclaimerComponent } from './legal/disclaimer.component';
import { AuthGuard } from './guards/auth.guard';

// Login is in src/app/login/ based on your screenshot
import { LoginComponent } from './login/login.component'; 

export const routes: Routes = [
  { path: '', component: SubmitComponent },
  { path: 'verify', component: PublicVerifyComponent },
  
  // Admin
  { path: 'admin/login', component: LoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  
  // Legal
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'disclaimer', component: DisclaimerComponent },

  { path: '**', redirectTo: '' }
];



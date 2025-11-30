import { Routes } from '@angular/router';
import { SubmitComponent } from './submit/submit.component';
import { PublicVerifyComponent } from './public-verify/public-verify.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './login/login.component';
import { TermsComponent } from './legal/terms.component';
import { PrivacyComponent } from './legal/privacy.component';
import { DisclaimerComponent } from './legal/disclaimer.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // FIXED: Added pathMatch: 'full' so this doesn't swallow other routes
  { path: '', component: SubmitComponent, pathMatch: 'full' },
  
  { path: 'verify', component: PublicVerifyComponent },
  
  // Login Route
  { path: 'login', component: LoginComponent },
  { path: 'admin/login', redirectTo: 'login', pathMatch: 'full' },
  
  // Protected Dashboard
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard] 
  },
  
  // Legal Pages
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'disclaimer', component: DisclaimerComponent },

  // Wildcard (Must be last)
  { path: '**', redirectTo: '' }
];



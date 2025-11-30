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
  // Public Routes
  { path: '', component: SubmitComponent },
  { path: 'verify', component: PublicVerifyComponent },
  
  // RESTORED: The explicit login route
  { path: 'login', component: LoginComponent },
  
  // Admin Routes (Protected)
  // Note: We map /admin/login to the same component just in case, but primary is /login
  { path: 'admin/login', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard] 
  },
  
  // Legal Pages
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'disclaimer', component: DisclaimerComponent },

  // Fallback
  { path: '**', redirectTo: '' }
];



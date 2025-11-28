import { Routes } from '@angular/router';
import { SubmitComponent } from './submit/submit.component';
import { PublicVerifyComponent } from './public-verify/public-verify.component';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'submit', pathMatch: 'full' },
  { path: 'submit', component: SubmitComponent },
  { path: 'verify', component: PublicVerifyComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard] 
  }
];

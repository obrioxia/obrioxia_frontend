import { Routes } from '@angular/router';
import { SubmitComponent } from './submit/submit.component';
import { PublicVerifyComponent } from './public-verify/public-verify.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'submit',
    pathMatch: 'full'
  },
  {
    path: 'submit',
    component: SubmitComponent
  },
  {
    path: 'verify',
    component: PublicVerifyComponent
  }
];
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const demoAccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);

  // 1. Safety Check: If going to the gate, allow it immediately
  if (state.url.includes('demo-gate')) {
    return true;
  }

  // 2. Check for the Key in specific Demo storage
  const key = localStorage.getItem('demo_key');

  if (key && key.length > 5) {
    return true;
  }

  // 3. No key? Redirect to the public Gate
  return router.createUrlTree(['/demo-gate']);
};

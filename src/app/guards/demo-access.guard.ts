import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const demoAccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);

  // 1. Check URL for access token (e.g. ?access=1)
  const urlAccess = route.queryParams['access'];

  if (urlAccess === '1') {
    // Grant access
    localStorage.setItem('obrioxia_demo_access', 'true');
    // Allow navigation
    return true;
  }

  // 2. Check LocalStorage for existing session
  const hasSession = localStorage.getItem('obrioxia_demo_access');

  if (hasSession === 'true') {
    return true;
  }

  // 3. Deny access -> Redirect to Gate
  return router.createUrlTree(['/access-denied']);
};

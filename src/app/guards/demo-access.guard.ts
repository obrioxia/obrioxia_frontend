import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/**
 * Guard to prevent unauthorized access to the demo dashboard.
 * Funnels users to the /demo-gate if no valid session key is present.
 */
export const demoAccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);

  // 1. Safety Check: If already heading to the gate, allow it to prevent recursion loops
  if (state.url.includes('demo-gate')) {
    return true;
  }

  // 2. Check for the Handshake Key in localStorage
  // Standardized to 'demo_key' to match AccessGate logic
  const key = localStorage.getItem('demo_key');

  // We check for length to ensure it's not just an empty string
  if (key && key.length > 5) {
    return true;
  }

  // 3. Authorization Missing: Redirect to the internal Access Gate
  // Using createUrlTree is the modern, performant way to handle redirects in guards
  return router.createUrlTree(['/demo-gate']);
};

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/**
 * Guard to protect demo routes. 
 * Checks for a valid session token from obrioxia.com or a local demo key.
 */
export const demoAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);

  // 1. Check if token is passed in URL (Handoff from obrioxia.com)
  const urlToken = route.queryParams['token'];

  if (urlToken) {
    // Store it and allow access
    localStorage.setItem('obrioxia_demo_token', urlToken);
    
    // Clean the URL bar for a professional look without a full reload
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({ path: newUrl }, '', newUrl);
    return true; 
  }

  // 2. Check if token exists in storage
  const storedToken = localStorage.getItem('obrioxia_demo_token');
  const demoKey = localStorage.getItem('obrioxia_demo_key'); // Check for the new Handshake key

  if (storedToken || demoKey) {
    return true;
  }

  // 3. No Authorization? Redirect to the internal Gate
  // This matches the 'demo-gate' path in your app.routes.ts
  router.navigate(['/demo-gate']);
  return false;
};

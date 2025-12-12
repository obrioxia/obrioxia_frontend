import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const demoAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);

  // 1. Check if token is passed in URL (Handoff from obrioxia.com)
  const urlToken = route.queryParams['token'];

  if (urlToken) {
    // Store it and allow access
    localStorage.setItem('obrioxia_demo_token', urlToken);
    // Optional: Remove query param from URL bar for cleanliness without reloading
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({path:newUrl},'',newUrl);
    return true; 
  }

  // 2. Check if token exists in storage
  const storedToken = localStorage.getItem('obrioxia_demo_token');

  if (storedToken) {
    return true;
  }

  // 3. No token? Force redirect to the main site signup
  // Change this URL to your actual signup page on the main site
  window.location.href = 'https://obrioxia.com/demo-signup';
  return false;
};

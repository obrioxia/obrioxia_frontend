import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  /**
   * Protects Admin routes by checking Firebase Authentication state.
   * If the user is not logged in, they are redirected to the /demo-gate.
   */
  canActivate(): Observable<boolean | UrlTree> {
    return authState(this.auth).pipe(
      take(1),
      map(user => {
        // ✅ If Firebase user exists, allow access to Admin Dashboard
        if (user) {
          return true;
        }

        // ❌ If NO user, redirect specifically to the entry gate
        // This prevents 404 errors by using a route defined in app.routes.ts
        return this.router.createUrlTree(['/demo-gate']);
      })
    );
  }
}

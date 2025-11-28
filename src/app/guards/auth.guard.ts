import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    return this.auth.user$.pipe(
      take(1),
      map(user => {
        if (user) return true;
        
        // Not logged in -> go to login
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  
  /**
   * Observable stream of the current Firebase user.
   * Components can subscribe to this to react to login/logout events.
   */
  user$: Observable<User | null> = user(this.auth);

  /**
   * Authenticates an admin user via Firebase.
   * Redirects to the Admin Dashboard upon success.
   */
  async login(email: string, pass: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, pass);
      // ✅ Matches the path defined in your app.routes.ts
      this.router.navigate(['/admin-dashboard']); 
    } catch (err) {
      console.error("Login Error:", err);
      throw err;
    }
  }

  /**
   * Signs the user out of Firebase.
   * Redirects back to the main login/gate page.
   */
  async logout() {
    await signOut(this.auth);
    // ✅ Sends user back to the entry gate
    this.router.navigate(['/demo-gate']); 
  }

  /**
   * Retrieves the current JWT token from Firebase.
   * Used by ApiService to authorize requests to the Render backend.
   */
  async getToken(): Promise<string | null> {
    const u = this.auth.currentUser;
    return u ? u.getIdToken() : null;
  }
}

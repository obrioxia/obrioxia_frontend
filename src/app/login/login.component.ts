import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth'; // <--- SECURE FIREBASE IMPORT

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Added RouterModule for links
  template: `
    <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-[#111] border border-gray-800 p-8 rounded-lg shadow-2xl">
        
        <div class="text-center mb-8">
           <h2 class="text-3xl font-bold text-white font-orbitron">SECURE HUB</h2>
           <p class="text-xs text-gray-500 mt-2 uppercase tracking-widest">Authorized Access Only</p>
        </div>
        
        <form (ngSubmit)="onLogin()" class="space-y-6">
          <div>
            <label class="block text-gray-400 text-xs font-bold mb-2 font-mono uppercase">Work Email</label>
            <input 
              [(ngModel)]="email" 
              name="email" 
              type="email" 
              class="w-full bg-black border border-gray-700 text-white p-3 rounded focus:border-cyan-500 focus:outline-none transition-colors font-mono" 
              placeholder="name@company.com"
              required
            >
          </div>
          
          <div>
            <label class="block text-gray-400 text-xs font-bold mb-2 font-mono uppercase">Password</label>
            <input 
              [(ngModel)]="password" 
              name="password" 
              type="password" 
              class="w-full bg-black border border-gray-700 text-white p-3 rounded focus:border-cyan-500 focus:outline-none transition-colors font-mono" 
              placeholder="••••••••"
              required
            >
          </div>

          <div *ngIf="errorMessage" class="p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-xs text-center font-bold">
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            [disabled]="isLoading"
            class="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-4 rounded transition-all disabled:opacity-50 uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            {{ isLoading ? 'VERIFYING...' : 'ACCESS HUB' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-500 text-xs">
            New User? 
            <a routerLink="/signup" class="text-cyan-500 hover:text-cyan-400 font-bold cursor-pointer">Create Account</a>
          </p>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  // Inject Firebase Auth directly
  private auth = inject(Auth);
  private router = inject(Router);

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  async onLogin() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // 1. TALK TO GOOGLE FIREBASE
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      
      // 2. GET SECURE TOKEN
      const token = await userCredential.user.getIdToken();
      
      // 3. SAVE SESSION
      localStorage.setItem('obrioxia_token', token);
      console.log("Login Secure: Token received");

      // 4. ENTER APP
      // Redirecting to root '/' usually handles the routing logic better than hardcoding /admin/dashboard
      this.router.navigate(['/']); 

    } catch (e: any) {
      console.error("Login Failed:", e);
      
      // Clearer Error Messages
      if (e.code === 'auth/invalid-credential') {
        this.errorMessage = "❌ Invalid Email or Password";
      } else if (e.code === 'auth/user-not-found') {
        this.errorMessage = "❌ User does not exist in Secure Vault";
      } else {
        this.errorMessage = "❌ Connection Error. Check Firebase Config.";
      }
    } finally {
      this.isLoading = false;
    }
  }
}

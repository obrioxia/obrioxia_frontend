import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { firstValueFrom, take } from 'rxjs';

@Component({
  selector: 'app-access-gate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative">
      <div class="max-w-md w-full text-center space-y-8 p-8 border border-white/10 rounded-2xl bg-[#111] shadow-2xl relative z-10">
        
        <div class="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 class="text-3xl text-white font-bold font-orbitron">Restricted Access</h1>
        <p class="text-gray-400">Sign in to request your demo key.</p>

        <!-- Sign-in form (shown when not signed in) -->
        <div *ngIf="!isSignedIn" class="space-y-4">
          <input 
            [(ngModel)]="email" 
            type="email" 
            placeholder="Email address"
            class="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
          >
          <input 
            [(ngModel)]="password" 
            type="password" 
            placeholder="Password"
            class="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
          >
          <div class="flex gap-2">
            <button 
              (click)="onSignIn()" 
              [disabled]="isLoading || !email || !password"
              class="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all uppercase tracking-widest text-xs font-orbitron disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isLoading ? '...' : 'Sign In' }}
            </button>
            <button 
              (click)="onSignUp()" 
              [disabled]="isLoading || !email || !password"
              class="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-all uppercase tracking-widest text-xs font-orbitron border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isLoading ? '...' : 'Sign Up' }}
            </button>
          </div>
        </div>

        <!-- Request key (shown after sign-in) -->
        <div *ngIf="isSignedIn && !keyRequested" class="space-y-4">
          <p class="text-green-400 text-sm">&#10003; Signed in as {{ userEmail }}</p>
          <button 
            (click)="onRequestKey()" 
            [disabled]="isLoading"
            class="block w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all uppercase tracking-widest font-orbitron shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isLoading ? 'Processing...' : 'Request Demo Key' }}
          </button>
        </div>

        <!-- Success message -->
        <div *ngIf="keyRequested" class="space-y-3">
          <p class="text-green-400 text-sm font-bold">&#10003; Key sent to {{ userEmail }}</p>
          <p class="text-gray-500 text-xs">Check your inbox, then enter the key below.</p>
        </div>

        <div class="mt-8 pt-8 border-t border-white/10">
          <p class="text-xs text-gray-500 mb-3 uppercase tracking-widest">Already have a key?</p>
          
          <div class="flex gap-2">
            <input 
              [(ngModel)]="inputKey"
              (keyup.enter)="verifyAndUnlock()" 
              type="text" 
              placeholder="Enter Key" 
              class="flex-1 border border-gray-700 rounded px-3 py-2 font-mono text-xs focus:border-cyan-500 outline-none text-white bg-black"
            >
            <button 
              type="button" 
              (click)="verifyAndUnlock()" 
              [disabled]="isLoading"
              class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded border border-gray-600 uppercase cursor-pointer disabled:opacity-50">
              {{ isLoading ? '...' : 'ENTER' }} 
            </button>
          </div>
          
          <p *ngIf="errorMessage" class="text-red-400 text-xs mt-3 font-bold animate-pulse">
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </div>
  `
})
export class AccessGateComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private auth = inject(Auth);

  email = '';
  password = '';
  inputKey = '';
  isLoading = false;
  errorMessage = '';
  isSignedIn = false;
  userEmail = '';
  keyRequested = false;

  async ngOnInit() {
    if (localStorage.getItem('demo_key')) {
      this.router.navigate(['/log']);
      return;
    }
    // Check if already signed in
    const user = await firstValueFrom(authState(this.auth).pipe(take(1)));
    if (user) {
      this.isSignedIn = true;
      this.userEmail = user.email || '';
    }
  }

  async onSignIn() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.isSignedIn = true;
      this.userEmail = this.email;
    } catch (err: any) {
      this.errorMessage = '\u274C Invalid credentials';
    } finally {
      this.isLoading = false;
    }
  }

  async onSignUp() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      this.isSignedIn = true;
      this.userEmail = this.email;
    } catch (err: any) {
      this.errorMessage = err.code === 'auth/email-already-in-use'
        ? '\u26A0\uFE0F Account exists \u2014 use Sign In'
        : '\u274C ' + (err.message || 'Sign-up failed');
    } finally {
      this.isLoading = false;
    }
  }

  async onRequestKey() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.api.requestDemoKey();
      this.keyRequested = true;
    } catch (err: any) {
      this.errorMessage = '\u26A0\uFE0F Error requesting key.';
    } finally {
      this.isLoading = false;
    }
  }

  verifyAndUnlock() {
    const key = this.inputKey.trim();
    if (!key) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.api.verifyDemoKey(key).subscribe({
      next: (res: any) => {
        if (res.valid) {
          localStorage.setItem('demo_key', key);
          this.router.navigate(['/log']);
        } else {
          this.isLoading = false;
          this.errorMessage = '\u274C Invalid or Expired Key';
        }
      },
      error: (err: any) => {
        console.error("Verification Error:", err);
        this.isLoading = false;
        this.errorMessage = '\u26A0\uFE0F Connection Error.';
      }
    });
  }
}

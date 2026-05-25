import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { firstValueFrom, take } from 'rxjs';

@Component({
  selector: 'app-access-gate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative">
      <div class="max-w-md w-full text-center space-y-6 p-8 border border-white/10 rounded-2xl bg-[#111] shadow-2xl relative z-10">
        
        <div class="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 class="text-3xl text-white font-bold font-orbitron">Enter your Obrioxia <span class="text-cyan-400">demo key</span></h1>

        <!-- Explanation block (shown before sign-in) -->
        <div *ngIf="!isSignedIn" class="text-left bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
          <p class="text-gray-300 text-sm font-medium">Paste the key you received after creating your account. This unlocks the demo environment.</p>
          <ul class="text-gray-400 text-xs space-y-1 list-disc pl-4 mt-2">
            <li>Log Event — submit a decision record to the ledger</li>
            <li>Verify Chain — check tamper-evident chain integrity</li>
            <li>Audit Ledger — browse all sealed records</li>
            <li>Shredder — crypto-shred sensitive fields</li>
            <li>Golden Path — guided walkthrough of the full flow</li>
          </ul>
          <p class="text-gray-500 text-xs mt-2">
            Don't have a key yet? <a href="https://obrioxia.com/signup" class="text-cyan-400 hover:underline">Create a demo account</a>
          </p>
        </div>

        <!-- Sign-in form (shown when not signed in) -->
        <div *ngIf="!isSignedIn && !showResetForm" class="space-y-4">
          <input 
            [(ngModel)]="email" 
            type="email" 
            placeholder="Email address"
            class="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
          >
          <div>
            <input 
              [(ngModel)]="password" 
              type="password" 
              placeholder="Password"
              class="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
            >
            <p class="text-gray-600 text-xs mt-1.5 text-left pl-1">Use at least 8 characters and 1 number.</p>
          </div>
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
          <button 
            (click)="showResetForm = true" 
            class="text-xs text-gray-500 hover:text-cyan-400 transition-colors underline">
            Forgot password?
          </button>
        </div>

        <!-- Password reset form -->
        <div *ngIf="!isSignedIn && showResetForm" class="space-y-4">
          <p class="text-gray-400 text-sm">Enter your email to receive a password reset link.</p>
          <input 
            [(ngModel)]="resetEmail" 
            type="email" 
            placeholder="Email address"
            class="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
          >
          <button 
            (click)="onResetPassword()" 
            [disabled]="isLoading || !resetEmail"
            class="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all uppercase tracking-widest text-xs font-orbitron disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </button>
          <button 
            (click)="showResetForm = false; resetEmail = ''; errorMessage = ''; successMessage = ''" 
            class="text-xs text-gray-500 hover:text-white transition-colors underline">
            Back to sign in
          </button>
        </div>

        <!-- Request key (shown after sign-in) -->
        <div *ngIf="isSignedIn && !keyRequested" class="space-y-4">
          <p class="text-green-400 text-sm">&#10003; Signed in as {{ userEmail }}</p>
          <p class="text-gray-500 text-xs">Click below to generate your demo key. It will be sent to your email and stored in your browser session.</p>
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
          
          <p *ngIf="errorMessage" class="text-red-400 text-xs mt-3 font-bold">
            {{ errorMessage }}
          </p>
          <p *ngIf="successMessage" class="text-green-400 text-xs mt-3 font-bold">
            {{ successMessage }}
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
  resetEmail = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isSignedIn = false;
  userEmail = '';
  keyRequested = false;
  showResetForm = false;

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
    this.successMessage = '';
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.isSignedIn = true;
      this.userEmail = this.email;
    } catch (err: any) {
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        this.errorMessage = 'Invalid email or password. Check your credentials and try again.';
      } else if (code === 'auth/too-many-requests') {
        this.errorMessage = 'Too many attempts. Please wait a few minutes and try again.';
      } else {
        this.errorMessage = 'Sign-in failed. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async onSignUp() {
    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }
    if (!/\d/.test(this.password)) {
      this.errorMessage = 'Password must contain at least 1 number.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      this.isSignedIn = true;
      this.userEmail = this.email;
    } catch (err: any) {
      const code = err.code || '';
      if (code === 'auth/email-already-in-use') {
        this.errorMessage = 'An account with this email already exists. Use Sign In instead.';
      } else if (code === 'auth/weak-password') {
        this.errorMessage = 'Password too weak. Use at least 8 characters and 1 number.';
      } else if (code === 'auth/invalid-email') {
        this.errorMessage = 'Please enter a valid email address.';
      } else {
        this.errorMessage = 'Sign-up failed: ' + (err.message || 'Please try again.');
      }
    } finally {
      this.isLoading = false;
    }
  }

  async onResetPassword() {
    if (!this.resetEmail) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await sendPasswordResetEmail(this.auth, this.resetEmail);
      this.successMessage = 'Reset link sent. Check your inbox.';
    } catch (err: any) {
      const code = err.code || '';
      if (code === 'auth/user-not-found') {
        this.errorMessage = 'No account found with that email.';
      } else if (code === 'auth/invalid-email') {
        this.errorMessage = 'Please enter a valid email address.';
      } else {
        this.errorMessage = 'Failed to send reset email. Please try again.';
      }
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
      this.errorMessage = 'Error requesting key. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  verifyAndUnlock() {
    const key = this.inputKey.trim();
    if (!key) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.verifyDemoKey(key).subscribe({
      next: (res: any) => {
        if (res.valid) {
          localStorage.setItem('demo_key', key);
          this.router.navigate(['/log']);
        } else {
          this.isLoading = false;
          this.errorMessage = 'Invalid or expired key. Please check and try again.';
        }
      },
      error: (err: any) => {
        console.error("Verification Error:", err);
        this.isLoading = false;
        this.errorMessage = 'Connection error. Please check your internet and try again.';
      }
    });
  }
}

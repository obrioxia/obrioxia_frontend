import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-gate',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  template: `
    <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative">
      
      <div class="max-w-md w-full text-center space-y-8 p-8 border border-white/10 rounded-2xl bg-[#111] shadow-2xl relative z-10">
        
        <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 class="text-3xl text-white font-bold font-orbitron">Restricted Access</h1>
        
        <p class="text-gray-400">
          The Obrioxia Demo Environment is invite-only.
        </p>

        <a href="https://obrioxia.com/demo-signup" target="_blank" class="block w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all uppercase tracking-widest font-orbitron shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          Get Session Key
        </a>

        <div class="mt-8 pt-8 border-t border-white/10">
          <p class="text-xs text-gray-500 mb-3 uppercase tracking-widest">Have a key?</p>
          
          <div class="flex gap-2">
            <input 
              [(ngModel)]="inputKey"
              (keyup.enter)="verifyAndUnlock($event)" 
              type="text" 
              placeholder="Enter UUID Key" 
              autocomplete="off"
              style="user-select: text !important; -webkit-user-select: text !important; background-color: #000 !important; color: #fff !important;"
              class="flex-1 border border-gray-700 rounded px-3 py-2 font-mono text-xs focus:border-cyan-500 outline-none text-white bg-black"
            >
            
            <button 
              type="button" 
              (click)="verifyAndUnlock()" 
              [disabled]="isLoading"
              class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded border border-gray-600 uppercase cursor-pointer disabled:opacity-50">
              {{ isLoading ? 'Checking...' : 'Unlock' }}
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
export class AccessGateComponent {
  http = inject(HttpClient);
  router = inject(Router);
  
  inputKey = '';
  isLoading = false;
  errorMessage = '';

  verifyAndUnlock(event?: Event) {
    // 1. STOP THE GHOST REFRESH
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const key = this.inputKey.trim();
    if (!key) return;

    this.isLoading = true;
    this.errorMessage = '';
    
    console.log("Starting verification for:", key);

    this.http.post('https://obrioxia-backend-pkrp.onrender.com/api/demo/verify', { key }).subscribe({
      next: (res: any) => {
        console.log("Backend response received:", res);
        
        if (res.valid) {
          // --- THE CRITICAL FIX IS HERE ---
          // Changed 'obrioxia_demo_key' to 'obrioxia_demo_token' to match your Guard
          localStorage.setItem('obrioxia_demo_token', key);
          
          if (res.user) {
             localStorage.setItem('demo_user_name', res.user);
          }
          
          console.log("Access Granted. Redirecting to Audit Ledger...");
          
          // Redirecting specifically to /audit-ledger to ensure we bypass the gate
          window.location.href = '/audit-ledger'; 
          
        } else {
          this.isLoading = false;
          this.errorMessage = '❌ Invalid Session Key';
          console.warn("Key rejected by backend.");
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Verification error:", err);
        this.errorMessage = '❌ Connection Failed';
      }
    });
  }
}

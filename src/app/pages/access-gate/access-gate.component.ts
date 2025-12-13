import { Component, inject, OnInit } from '@angular/core'; // Added OnInit
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
        
        <h1 class="text-3xl text-white font-bold font-orbitron">Restricted Access</h1>
        
        <div class="mt-8 pt-8 border-t border-white/10">
          <div class="flex gap-2">
            <input 
              [(ngModel)]="inputKey"
              (keyup.enter)="verifyAndUnlock($event)" 
              type="text" 
              placeholder="Enter UUID Key" 
              class="flex-1 border border-gray-700 rounded px-3 py-2 font-mono text-xs focus:border-cyan-500 outline-none text-white bg-black"
            >
            <button 
              type="button" 
              (click)="verifyAndUnlock()" 
              class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded border border-gray-600 uppercase cursor-pointer">
              {{ isLoading ? '...' : 'TRY UNLOCK' }} 
            </button>
          </div>
          <p *ngIf="errorMessage" class="text-red-400 text-xs mt-3 font-bold">{{ errorMessage }}</p>
        </div>

      </div>
    </div>
  `
})
export class AccessGateComponent implements OnInit {
  http = inject(HttpClient);
  router = inject(Router);
  
  inputKey = '';
  isLoading = false;
  errorMessage = '';

  // 1. AUTO-CHECK: If I already have a key, let me in!
  ngOnInit() {
    if (localStorage.getItem('obrioxia_demo_token')) {
      console.log("Token found! Attempting auto-login...");
      // Don't redirect automatically yet, let's wait for the user to try manually so we can debug
    }
  }

  verifyAndUnlock(event?: Event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    const key = this.inputKey.trim();
    if (!key) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.http.post('https://obrioxia-backend-pkrp.onrender.com/api/demo/verify', { key }).subscribe({
      next: (res: any) => {
        if (res.valid) {
          // 2. SUCCESS
          localStorage.setItem('obrioxia_demo_token', key);
          
          // 3. THE POPUP TEST
          alert("✅ LOGIN SUCCESS!\n\nI am about to redirect you to '/audit-ledger'.\n\nIf the page goes blank or returns here, that route does not exist.");

          // 4. ATTEMPT REDIRECT
          window.location.href = '/audit-ledger'; 
          
        } else {
          this.isLoading = false;
          alert("❌ Key Rejected. Check console.");
        }
      },
      error: (err) => {
        this.isLoading = false;
        alert("❌ Network Error.");
      }
    });
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-gate',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div class="max-w-md w-full text-center space-y-8 p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-lg">
        
        <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 class="text-3xl text-white font-bold font-orbitron">Restricted Access</h1>
        
        <p class="text-gray-400">
          The Obrioxia Demo Environment is invite-only. You must request access via our main portal to obtain a session key.
        </p>

        <a href="https://obrioxia.com/demo-signup" class="block w-full py-4 bg-obrioxia-cyan hover:bg-cyan-400 text-black font-bold rounded-lg transition-all uppercase tracking-widest font-orbitron shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          Get Session Key
        </a>

        <div class="mt-8 pt-8 border-t border-white/10">
          <p class="text-xs text-gray-500 mb-3 uppercase tracking-widest">Already have a key?</p>
          
          <div class="flex gap-2">
            <input 
              #keyInput 
              type="text" 
              (keyup.enter)="submitKey(keyInput.value)"
              placeholder="Paste UUID Key Here" 
              class="flex-1 bg-black/50 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm focus:border-cyan-500 outline-none transition-colors"
            >
            <button 
              (click)="submitKey(keyInput.value)" 
              class="px-4 py-2 bg-gray-800 hover:bg-gray-700 hover:text-cyan-400 text-gray-300 text-xs font-bold rounded border border-gray-600 transition-all uppercase tracking-wider">
              Unlock
            </button>
          </div>
          
          <p *ngIf="errorMsg" class="text-red-400 text-xs mt-2">{{ errorMsg }}</p>
        </div>

      </div>
    </div>
  `
})
export class AccessGateComponent {
  router = inject(Router);
  errorMsg = '';

  submitKey(key: string) {
    if (!key.trim()) return;
    
    // We simply reload the page with the key in the URL.
    // The Guard checks the URL, calls the API, and lets you in if valid.
    window.location.href = `/?access=${key.trim()}`;
  }
}

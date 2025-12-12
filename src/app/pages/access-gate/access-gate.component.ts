import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

        <a href="https://obrioxia.com" class="block w-full py-4 bg-obrioxia-cyan hover:bg-cyan-400 text-black font-bold rounded-lg transition-all uppercase tracking-widest font-orbitron shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          Go to Obrioxia.com to Sign Up
        </a>

        <p class="text-xs text-gray-600 uppercase tracking-widest pt-4">Session Token Missing</p>
      </div>
    </div>
  `
})
export class AccessGateComponent {}

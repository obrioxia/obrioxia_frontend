import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Added to complete global build-sync

@Component({
  selector: 'app-terms',
  standalone: true, // ✅ Standalone components handle their own module logic
  imports: [CommonModule, FormsModule], // ✅ Required to resolve remaining NG8002 ghost errors
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-300 font-sans p-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl text-white font-orbitron mb-6">Terms of <span class="text-cyan-400">Service</span></h1>
        
        <div class="bg-black/40 border border-gray-800 rounded-xl p-8 space-y-4 shadow-2xl backdrop-blur-md">
          <p class="text-xs text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-4 mb-6">
            Effective Date: November 2025
          </p>
          
          <p class="text-sm md:text-base leading-relaxed">
            By accessing the <span class="text-white">Obrioxia Audit Engine</span>, you agree to these terms. This system provides immutable cryptographic proof for insurance events.
          </p>
          
          <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">1. Usage Limits</h2>
          <p class="text-sm md:text-base leading-relaxed">
            Access is strictly restricted to authorized agents. All actions, including logins and data submissions, are logged permanently on the audit chain for forensic review.
          </p>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">2. Immutable Data</h2>
          <p class="text-sm md:text-base leading-relaxed">
            Data submitted to the engine <span class="text-white font-bold underline">cannot be modified or deleted</span>. Users are responsible for ensuring absolute accuracy before sealing events into the ledger.
          </p>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">3. Liability</h2>
          <p class="text-sm md:text-base leading-relaxed italic text-gray-400">
            Obrioxia provides audit trails "as is". Verification relies solely on the mathematical integrity of the cryptographic hash chain.
          </p>

          <div class="pt-8 mt-8 border-t border-gray-800 flex justify-between items-center">
            <span class="text-[10px] text-gray-600 uppercase tracking-widest">v4.2 PROD-READY</span>
            <div class="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TermsComponent {}

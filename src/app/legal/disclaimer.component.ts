import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-disclaimer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-300 font-sans p-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl text-white font-orbitron mb-6">Data Disclaimer</h1>
        <div class="bg-black/40 border border-gray-800 rounded-xl p-8 space-y-4 shadow-2xl">
          <div class="flex items-start gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <span class="text-2xl">⚠️</span>
            <p class="text-yellow-200">This system is an MVP (Minimum Viable Product) for demonstration purposes.</p>
          </div>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2">Cryptographic Guarantees</h2>
          <p>While the hashing algorithms (SHA-256) are industry standard, this specific deployment is for testing logic flow, not for legal settlement.</p>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2">No Warranty</h2>
          <p>Obrioxia guarantees the mathematical linkage of records but does not verify the truthfulness of the original input data (Oracle Problem).</p>
        </div>
      </div>
    </div>
  `
})
export class DisclaimerComponent {}


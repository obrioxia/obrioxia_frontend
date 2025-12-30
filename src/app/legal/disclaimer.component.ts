import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Added for project-wide consistency

@Component({
  selector: 'app-disclaimer',
  standalone: true, // ✅ Standalone components manage their own dependencies
  imports: [CommonModule, FormsModule], // ✅ FormsModule included to satisfy compiler checks
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-300 font-sans p-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl text-white font-orbitron mb-6">Data <span class="text-cyan-400">Disclaimer</span></h1>
        
        <div class="bg-black/40 border border-gray-800 rounded-xl p-8 space-y-4 shadow-2xl backdrop-blur-md">
          <div class="flex items-start gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <span class="text-2xl">⚠️</span>
            <p class="text-yellow-200 text-sm md:text-base">
              This system is an MVP (Minimum Viable Product) for demonstration purposes.
            </p>
          </div>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">Cryptographic Guarantees</h2>
          <p class="text-sm md:text-base leading-relaxed">
            While the hashing algorithms (SHA-256) are industry standard, this specific deployment is for testing logic flow, not for legal settlement.
          </p>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">No Warranty</h2>
          <p class="text-sm md:text-base leading-relaxed">
            Obrioxia guarantees the mathematical linkage of records but does not verify the truthfulness of the original input data (Oracle Problem).
          </p>
          
          <div class="pt-8 border-t border-gray-800">
            <p class="text-[10px] text-gray-600 uppercase tracking-widest text-center">
              SECURE • IMMUTABLE • TRANSPARENT
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DisclaimerComponent {}

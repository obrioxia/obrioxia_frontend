import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Added to maintain project-wide build consistency

@Component({
  selector: 'app-privacy',
  standalone: true, // ✅ Standalone architecture requires explicit imports per component
  imports: [CommonModule, FormsModule], // ✅ Required to pass strict Angular compiler checks
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-300 font-sans p-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl text-white font-orbitron mb-6">Privacy <span class="text-cyan-400">Policy</span></h1>
        
        <div class="bg-black/40 border border-gray-800 rounded-xl p-8 space-y-4 shadow-2xl backdrop-blur-md">
          <div class="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg mb-6">
            <p><strong class="text-cyan-400">Data Minimization:</strong> We only store data explicitly submitted for audit purposes.</p>
          </div>
          
          <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">1. Information Collection</h2>
          <p class="text-sm md:text-base leading-relaxed">
            We collect Agent IDs, timestamps, and claim metadata solely for the purpose of generating immutable audit trails.
          </p>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">2. Data Storage</h2>
          <p class="text-sm md:text-base leading-relaxed">
            Audit logs are stored in a secure, immutable database. Cryptographic hashes are public for verification; however, the raw payload data is restricted to authorized entities.
          </p>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">3. Third Parties</h2>
          <p class="text-sm md:text-base leading-relaxed">
            We do not sell data. Data is shared only with the specific insurance carrier authorized to view the ledger via the forensic dashboard.
          </p>

          <div class="pt-8 mt-8 border-t border-gray-800 text-center">
            <p class="text-[10px] text-gray-600 uppercase tracking-widest">
              OBRIOXIA DATA PROTECTION PROTOCOL v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PrivacyComponent {}

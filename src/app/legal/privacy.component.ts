import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-300 font-sans p-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl text-white font-orbitron mb-6">Privacy Policy</h1>
        <div class="bg-black/40 border border-gray-800 rounded-xl p-8 space-y-4 shadow-2xl">
          <p><strong>Data Minimization:</strong> We only store data explicitly submitted for audit.</p>
          
          <h2 class="text-xl text-cyan-400 mt-6 mb-2">1. Information Collection</h2>
          <p>We collect Agent IDs, timestamps, and claim metadata for the purpose of generating audit trails.</p>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2">2. Data Storage</h2>
          <p>Audit logs are stored in a secure, immutable database. Hashes are public; payload data is restricted.</p>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2">3. Third Parties</h2>
          <p>We do not sell data. Data is shared only with the specific insurance carrier authorized to view the ledger.</p>
        </div>
      </div>
    </div>
  `
})
export class PrivacyComponent {}


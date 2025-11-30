import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-300 font-sans p-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl text-white font-orbitron mb-6">Terms of Service</h1>
        <div class="bg-black/40 border border-gray-800 rounded-xl p-8 space-y-4 shadow-2xl">
          <p><strong>Effective Date:</strong> November 2025</p>
          <p>By accessing the Obrioxia Audit Engine, you agree to these terms. This system provides immutable cryptographic proof for insurance events.</p>
          
          <h2 class="text-xl text-cyan-400 mt-6 mb-2">1. Usage Limits</h2>
          <p>Access is restricted to authorized agents. All actions are logged permanently on the audit chain.</p>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2">2. Immutable Data</h2>
          <p>Data submitted to the engine cannot be modified or deleted. Ensure accuracy before sealing events.</p>

          <h2 class="text-xl text-cyan-400 mt-6 mb-2">3. Liability</h2>
          <p>Obrioxia provides audit trails "as is". Verification relies on mathematical integrity of the hash chain.</p>
        </div>
      </div>
    </div>
  `
})
export class TermsComponent {}


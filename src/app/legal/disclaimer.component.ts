import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-disclaimer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-300 font-sans p-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl text-white font-orbitron mb-6">Data <span class="text-cyan-400">Disclaimer</span></h1>

        <div class="bg-black/40 border border-gray-800 rounded-xl p-8 space-y-6 shadow-2xl backdrop-blur-md text-sm md:text-base leading-relaxed">

          <section>
            <h2 class="text-xl text-cyan-400 mt-2 mb-2 font-orbitron">1. Synthetic Data Only</h2>
            <p>All data displayed in this demo environment is synthetic. It does not represent real individuals, real decisions, or real outcomes. Do not enter real personal data.</p>
          </section>

          <section>
            <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">2. What This Demo Illustrates</h2>
            <p>This demo illustrates tamper-evident logging and write-only protection for selected fields. Events are sealed into a hash chain that detects any modification after the fact.</p>
          </section>

          <section>
            <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">3. Chain Verification</h2>
            <p>Each event is linked to the previous record by a cryptographic hash. The chain can be independently verified at any time to confirm that no records have been altered.</p>
          </section>

          <section>
            <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">4. No Real Data</h2>
            <p>This environment is not intended for production use. Any data entered should be fictional. We accept no responsibility for real personal data submitted to this demo.</p>
          </section>

        </div>

        <div class="mt-8">
          <a routerLink="/log" class="text-cyan-400 text-sm hover:underline font-orbitron">← Back to Demo</a>
        </div>
      </div>
    </div>
  `
})
export class DisclaimerComponent { }

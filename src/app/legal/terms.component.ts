import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-300 font-sans p-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl text-white font-orbitron mb-6">Terms &amp; <span class="text-cyan-400">Conditions</span></h1>

        <div class="bg-black/40 border border-gray-800 rounded-xl p-8 space-y-6 shadow-2xl backdrop-blur-md text-sm md:text-base leading-relaxed">

          <section>
            <h2 class="text-xl text-cyan-400 mt-2 mb-2 font-orbitron">1. Demo Purpose</h2>
            <p>This is a demonstration environment. All data within this demo is synthetic and generated for illustration purposes only. The demo is provided to help you evaluate the capabilities of the platform.</p>
          </section>

          <section>
            <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">2. Synthetic Data Only</h2>
            <p>Do not submit real personal data into this demo. You are responsible for ensuring that any data you enter is fictitious or non-sensitive. We accept no liability for real data submitted to the demo environment.</p>
          </section>

          <section>
            <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">3. No Warranties</h2>
            <p>This demo is provided "as is" without warranties of any kind, either express or implied. We make no guarantees regarding availability, accuracy, or fitness for any particular purpose.</p>
          </section>

          <section>
            <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">4. Service Basis</h2>
            <p>The service is provided as-is for evaluation purposes. No service-level agreement applies to this demo environment. Features shown may not reflect the final production offering.</p>
          </section>

          <section>
            <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">5. Changes</h2>
            <p>This demo environment may be updated, modified, or removed at any time without notice.</p>
          </section>

        </div>

        <div class="mt-8">
          <a routerLink="/log" class="text-cyan-400 text-sm hover:underline font-orbitron">← Back to Demo</a>
        </div>
      </div>
    </div>
  `
})
export class TermsComponent { }

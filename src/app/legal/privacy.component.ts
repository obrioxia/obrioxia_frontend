import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-300 font-sans p-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl text-white font-orbitron mb-6">Privacy <span class="text-cyan-400">Policy</span></h1>

        <div class="bg-black/40 border border-gray-800 rounded-xl p-8 space-y-6 shadow-2xl backdrop-blur-md text-sm md:text-base leading-relaxed">

          <section>
            <h2 class="text-xl text-cyan-400 mt-2 mb-2 font-orbitron">1. Demo Environment</h2>
            <p>This is a demonstration environment. It is not intended for processing real personal data. Please avoid entering genuine personal information.</p>
          </section>

          <section>
            <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">2. Data Submitted</h2>
            <p>Any data submitted through this demo may be stored for demonstration and diagnostic purposes. This data is treated as synthetic and may be periodically cleared.</p>
          </section>

          <section>
            <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">3. No Sensitive Data</h2>
            <p>This demo is not designed to handle sensitive personal data. Do not submit information that could identify a real individual, including names, addresses, financial details, or health records.</p>
          </section>

          <section>
            <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">4. Storage</h2>
            <p>Demo data is stored for demonstration purposes only and may be deleted without notice. This environment does not represent a production data-handling commitment.</p>
          </section>

          <section>
            <h2 class="text-xl text-cyan-400 mt-6 mb-2 font-orbitron">5. Not a Consumer Commitment</h2>
            <p>This privacy policy applies only to this demo environment. It does not constitute a consumer privacy commitment or replace any production privacy policy.</p>
          </section>

        </div>

        <div class="mt-8">
          <a routerLink="/log" class="text-cyan-400 text-sm hover:underline font-orbitron">← Back to Demo</a>
        </div>
      </div>
    </div>
  `
})
export class PrivacyComponent { }

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-demo-shred',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="pb-20 relative">

      <div
        class="relative overflow-hidden mb-8 py-10 border-b border-gray-800 bg-gradient-to-b from-[#050a0f] to-transparent">
        <div class="relative z-10 px-4">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter font-orbitron">
            <span class="text-gray-100">CRYPTO</span>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300 ml-2 md:ml-4">SHREDDER</span>
          </h1>
          <p class="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed font-sans">
            Destroy access to sensitive fields while preserving the tamper-evident audit chain.
            This demonstrates GDPR Article 17 compliance via cryptographic erasure.
          </p>
        </div>
      </div>

      <div class="mb-8 border border-red-900/30 bg-red-900/5 rounded p-4 mx-4 md:mx-0">
        <h3 class="text-red-500 font-bold text-sm uppercase tracking-wider mb-1 font-orbitron">⚠ IRREVERSIBLE ACTION</h3>
        <p class="text-red-500/70 text-xs font-sans">
          Shredding permanently destroys the encryption key for a record's PII.
          The audit hash chain remains intact — only the personal data becomes irrecoverable.
          Limited to 3 shreds per demo session.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- Left: Shred Form -->
        <div class="bg-[#0a0a0a] p-6 rounded-lg border border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-4 font-orbitron">
            <span class="text-red-500">►</span> Execute Data Erasure
          </h2>

          <div class="mb-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700 space-y-6">
            <div>
              <h3 class="text-white font-semibold text-lg mb-2">What this demonstrates</h3>
              <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1">
                <li>GDPR Article 17 "Right to Erasure" via crypto-shredding</li>
                <li>Encryption keys are destroyed — PII becomes mathematically irrecoverable</li>
                <li>The audit chain stays intact to prove the event occurred</li>
                <li>Ownership-verified: you can only shred records you created</li>
              </ul>
            </div>
            <div>
              <h3 class="text-white font-semibold text-lg mb-2">How to use</h3>
              <ol class="text-slate-300 text-sm list-decimal pl-5 space-y-1">
                <li>Enter a <strong class="text-white">Policy Number</strong> from a record you created in the Logger</li>
                <li>Confirm the shred action</li>
                <li>Check the <strong class="text-white">Audit Ledger</strong> — the record will show as [SHREDDED]</li>
              </ol>
            </div>
          </div>

          <div class="space-y-5 font-sans">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1 font-orbitron">TARGET POLICY NUMBER</label>
              <input [(ngModel)]="targetId" type="text"
                class="w-full bg-[#050505] border border-red-900/50 rounded p-3 text-white focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)] outline-none transition-all font-mono"
                placeholder="e.g. OBX-2025-001">
            </div>

            <button (click)="shred()" [disabled]="loading() || !targetId"
              class="w-full bg-red-500/10 hover:bg-red-600 border border-red-500 text-red-400 hover:text-white font-bold py-4 rounded shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 font-orbitron tracking-wider uppercase">
              {{ loading() ? 'EXECUTING SHRED...' : 'EXECUTE CRYPTO-SHRED' }}
            </button>

            <p class="mt-3 text-center text-xs text-slate-500 italic">
              (In production, this would be triggered by a GDPR erasure request workflow)
            </p>
          </div>
        </div>

        <!-- Right: Result Panel -->
        <div class="bg-[#0a0a0a] p-6 rounded-lg border border-gray-800 flex flex-col h-full min-h-[400px] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div class="flex-grow flex flex-col justify-center items-center text-center">

            <div *ngIf="!result() && !errorMsg()" class="text-gray-700 animate-pulse">
              <div class="text-6xl mb-4 opacity-20">🔥</div>
              <p class="text-sm font-orbitron text-gray-600">AWAITING SHRED COMMAND...</p>
            </div>

            <div *ngIf="result()" class="w-full text-left space-y-4 animate-fade-in-up">
              <div
                class="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6 text-center text-sm font-bold tracking-widest font-orbitron shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                ✓ SHRED EXECUTED
              </div>

              <div class="space-y-4 font-mono text-xs">
                <div class="bg-black p-3 rounded border border-gray-800">
                  <span class="text-gray-500 block mb-1 font-orbitron text-[10px]">TARGET</span>
                  <span class="text-white text-sm">{{ result()!.target }}</span>
                </div>
                <div class="bg-black p-3 rounded border border-gray-800">
                  <span class="text-gray-500 block mb-1 font-orbitron text-[10px]">STATUS</span>
                  <span class="text-red-400 text-sm">{{ result()!.status === 'already_shredded' ? 'ALREADY SHREDDED' : 'PII DESTROYED' }}</span>
                </div>
                <div class="bg-black p-3 rounded border border-gray-800">
                  <span class="text-gray-500 block mb-1 font-orbitron text-[10px]">SHREDS REMAINING</span>
                  <span class="text-white text-sm">{{ result()!.remaining ?? 'N/A' }}</span>
                </div>
                <div class="bg-black p-3 rounded border border-gray-800">
                  <span class="text-gray-500 block mb-1 font-orbitron text-[10px]">CHAIN INTEGRITY</span>
                  <span class="text-green-400 text-sm">PRESERVED ✓</span>
                </div>
              </div>

              <button (click)="reset()" class="mt-6 w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded border border-gray-700 transition-colors text-xs uppercase font-bold font-orbitron">
                Shred Another Record
              </button>
            </div>

            <div *ngIf="errorMsg()" class="w-full text-center">
              <div class="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p class="text-red-400 text-sm font-bold mb-2">{{ errorMsg() }}</p>
                <button (click)="reset()" class="text-xs text-red-300 underline hover:text-white">Try Again</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class DemoShredComponent {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl.replace(/\/$/, '').replace(/\/api$/, '');

    targetId = '';
    loading = signal(false);
    result = signal<{ target: string; status: string; remaining: number } | null>(null);
    errorMsg = signal<string>('');

    shred() {
        if (!this.targetId) return;
        if (!confirm('PERMANENT ACTION: This will destroy the encryption key for "' + this.targetId + '". The data becomes irrecoverable. Continue?')) return;

        this.loading.set(true);
        this.result.set(null);
        this.errorMsg.set('');

        const key = localStorage.getItem('demo_key') || '';
        const url = this.apiUrl + '/api/demo/shred/' + encodeURIComponent(this.targetId);
        this.http.post<any>(
            url,
            {},
            { headers: new HttpHeaders({ 'x-demo-key': key }) }
        ).subscribe({
            next: (res) => {
                this.result.set({
                    target: this.targetId,
                    status: res.status,
                    remaining: res.shreds_remaining ?? 0
                });
                this.targetId = '';
                this.loading.set(false);
            },
            error: (err) => {
                this.errorMsg.set(err.error?.detail || err.message || 'Shred failed');
                this.loading.set(false);
            }
        });
    }

    reset() {
        this.result.set(null);
        this.errorMsg.set('');
    }
}

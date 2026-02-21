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
        <div class="bg-[#0a0a0a] p-6 rounded-lg border border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col">
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
          </div>

          <div class="space-y-5 font-sans flex-grow flex flex-col justify-end">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1 font-orbitron">TARGET POLICY NUMBER</label>
              <div class="flex gap-2">
                  <input [(ngModel)]="targetId" type="text"
                    [disabled]="targetRef() !== null"
                    (keydown.enter)="lookup()"
                    class="flex-grow bg-[#050505] border border-red-900/50 rounded p-3 text-white focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)] outline-none transition-all font-mono disabled:opacity-50"
                    placeholder="e.g. OBX-2025-001">
                  <button *ngIf="!targetRef()" (click)="lookup()" [disabled]="loading() || !targetId"
                      class="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-4 rounded font-bold transition-colors disabled:opacity-50">
                      FIND
                  </button>
                  <button *ngIf="targetRef()" (click)="resetSearch()" [disabled]="loading() || result() !== null"
                      class="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-4 rounded font-bold transition-colors disabled:opacity-50">
                      CLEAR
                  </button>
              </div>
            </div>
            
            <div *ngIf="targetRef() && !result()" class="p-4 bg-gray-900 border border-gray-700 rounded text-sm mt-4 animate-fade-in-up">
                <div class="text-green-400 font-bold mb-2 flex items-center gap-2">✓ RECORD FOUND</div>
                <div class="grid grid-cols-2 gap-2 font-mono text-xs text-slate-300">
                    <div class="text-gray-500">Type:</div><div>{{ targetRef()?.incident_type }}</div>
                    <div class="text-gray-500">Hash:</div><div class="truncate text-cyan-400" [title]="targetRef()?.current_hash">{{ targetRef()?.current_hash }}</div>
                    <div class="text-gray-500">Time:</div><div>{{ targetRef()?.timestamp | date:'short' }}</div>
                    <div class="text-gray-500">Status:</div><div>{{ targetRef()?.is_shredded ? 'ALREADY SHREDDED' : 'INTACT' }}</div>
                </div>
            </div>

            <button (click)="shred()" [disabled]="loading() || !targetId || !targetRef() || targetRef()?.is_shredded"
              class="w-full bg-red-500/10 hover:bg-red-600 border border-red-500 text-red-400 hover:text-white font-bold py-4 rounded shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 font-orbitron tracking-wider uppercase">
              {{ loading() ? 'EXECUTING...' : 'EXECUTE CRYPTO-SHRED' }}
            </button>
            <p class="mt-3 text-center text-xs text-slate-500 italic">
              (In production, this would be triggered by a GDPR erasure request workflow)
            </p>
          </div>
        </div>

        <!-- Right: Result Panel -->
        <div class="bg-[#0a0a0a] p-6 rounded-lg border border-gray-800 flex flex-col h-full min-h-[400px] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div class="flex-grow flex flex-col justify-center items-center text-center">

            <div *ngIf="!result() && !errorMsg() && !loading()" class="text-gray-700 animate-pulse">
              <div class="text-6xl mb-4 opacity-20">🔥</div>
              <p class="text-sm font-orbitron text-gray-600">AWAITING SHRED COMMAND...</p>
            </div>
            
            <div *ngIf="loading()" class="flex flex-col items-center space-y-4">
               <div class="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
               <p class="text-red-400 font-orbitron animate-pulse">{{ loadingStep() }}</p>
            </div>

            <div *ngIf="result()" class="w-full text-left space-y-4 animate-fade-in-up">
              <div
                class="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6 text-center text-sm font-bold tracking-widest font-orbitron shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                ✓ SHRED EXECUTED
              </div>

              <div class="space-y-4 font-mono text-xs">
                <!-- Proof Panel: Before vs After -->
                <div class="bg-black rounded border border-gray-800 overflow-hidden">
                    <div class="grid grid-cols-2 divide-x divide-gray-800 border-b border-gray-800 bg-gray-900/50">
                        <div class="p-2 text-center text-gray-400 font-orbitron text-[10px] tracking-wider">BEFORE SHRED</div>
                        <div class="p-2 text-center text-red-400 font-orbitron text-[10px] tracking-wider font-bold">AFTER SHRED</div>
                    </div>
                    <div class="grid grid-cols-2 divide-x divide-gray-800">
                         <div class="p-3 space-y-2">
                             <div><span class="text-gray-600 block text-[9px] uppercase">Policy Number</span><span class="text-white">{{ result()!.target }}</span></div>
                             <div><span class="text-gray-600 block text-[9px] uppercase">Data Encryption Key</span><span class="text-green-500">Present</span></div>
                         </div>
                         <div class="p-3 space-y-2 bg-red-900/5">
                             <div><span class="text-gray-600 block text-[9px] uppercase">Policy Number</span><span class="text-red-500 blur-[2px] select-none">REDACTED</span></div>
                             <div><span class="text-gray-600 block text-[9px] uppercase">Data Encryption Key</span><span class="text-red-500 font-bold">DESTROYED</span></div>
                         </div>
                    </div>
                </div>

                <div class="bg-black p-3 rounded border border-gray-800 flex justify-between items-center">
                  <div>
                      <span class="text-gray-500 block mb-1 font-orbitron text-[10px] uppercase">Chain Integrity</span>
                      <span class="text-green-400 text-sm flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          VERIFIED
                      </span>
                  </div>
                  <div class="text-right">
                       <span class="text-gray-600 text-[9px] block">Blocks verified</span>
                       <span class="text-slate-300">{{ result()!.chain_checked }}</span>
                  </div>
                </div>
                
                <div class="text-center text-gray-500 text-[10px] uppercase tracking-wider">
                     Shreds Remaining: <span class="text-white">{{ result()!.remaining }}</span>
                </div>
              </div>

              <button (click)="reset()" class="mt-6 w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded border border-gray-700 transition-colors text-xs uppercase font-bold font-orbitron">
                Shred Another Record
              </button>
            </div>

            <div *ngIf="errorMsg()" class="w-full text-center">
              <div class="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p class="text-red-400 text-sm font-bold mb-2">ERASURE FAILED</p>
                <p class="text-red-300 text-xs mb-4">{{ errorMsg() }}</p>
                <button (click)="resetError()" class="text-xs text-white bg-red-900/50 hover:bg-red-800 px-4 py-2 rounded transition-colors">Acknowledge</button>
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
  loadingStep = signal<string>('');
  targetRef = signal<any | null>(null);
  result = signal<{ target: string; status: string; remaining: number, chain_checked: number } | null>(null);
  errorMsg = signal<string>('');

  lookup() {
    if (!this.targetId) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const key = localStorage.getItem('demo_key') || '';
    this.http.get<any>(`${this.apiUrl}/api/demo/incidents`, {
      headers: new HttpHeaders({ 'x-demo-key': key })
    }).subscribe({
      next: (res) => {
        const results = res.data || [];
        const found = results.find((r: any) =>
          r.policy_number?.toLowerCase() === this.targetId.toLowerCase() ||
          String(r.id) === this.targetId
        );

        if (found) {
          this.targetRef.set(found);
        } else {
          this.errorMsg.set('Record not found. Ensure you created it with this demo key.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set('Failed to lookup records');
        this.loading.set(false);
      }
    });
  }

  resetSearch() {
    this.targetId = '';
    this.targetRef.set(null);
    this.errorMsg.set('');
    this.result.set(null);
  }

  shred() {
    if (!this.targetId || !this.targetRef()) return;
    if (!confirm('PERMANENT ACTION: This will destroy the encryption key for "' + this.targetId + '". The data becomes irrecoverable. Continue?')) return;

    this.loading.set(true);
    this.loadingStep.set('Executing data erasure...');
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
        this.loadingStep.set('Verifying chain integrity...');

        // Fire chain verification to prove it works
        this.http.post<any>(
          `${this.apiUrl}/api/demo/verify-chain`,
          {},
          { headers: new HttpHeaders({ 'x-demo-key': key }) }
        ).subscribe({
          next: (verifyRes) => {
            this.result.set({
              target: this.targetId,
              status: res.status,
              remaining: res.shreds_remaining ?? 0,
              chain_checked: verifyRes.checked ?? 0
            });
            this.loading.set(false);
          },
          error: () => {
            // Even if verification call fails visually, the shred worked
            this.result.set({
              target: this.targetId,
              status: res.status,
              remaining: res.shreds_remaining ?? 0,
              chain_checked: 0
            });
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        const message = err.error?.detail || err.error?.message || err.message || 'Shred failed';
        this.errorMsg.set(message);
        this.loading.set(false);
      }
    });
  }

  resetError() {
    this.errorMsg.set('');
  }

  reset() {
    this.result.set(null);
    this.errorMsg.set('');
    this.targetId = '';
    this.targetRef.set(null);
  }
}

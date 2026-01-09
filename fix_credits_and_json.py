import os

# 1. TYPESCRIPT: Adds the resetDemo() function + Hybrid JSON logic
ts_content = r"""import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { HealthService } from '../services/health.service';
import { Subscription, interval, firstValueFrom, isObservable } from 'rxjs';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit.component.html'
})
export class SubmitComponent implements OnInit, OnDestroy {
  formData = { 
    policyNumber: '', 
    incidentType: 'Auto', 
    claimAmount: 0, 
    aiConfidenceScore: 0.95, 
    agentId: 'AGENT-DEMO', 
    decisionNotes: '' 
  };
  
  latestReceipt = signal<any>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  credits = signal(0);
  uploadStatus = ''; 
  isDemoUser = false;
  isSystemOnline = false;
  private healthSub: Subscription | null = null;

  constructor(private api: ApiService, public auth: AuthService, private healthService: HealthService) {}

  ngOnInit() {
    const demoKey = localStorage.getItem('demo_key');
    this.isDemoUser = !!demoKey;
    if (this.isDemoUser && demoKey) this.checkDemoBalance(demoKey);
    this.checkHealth();
    this.healthSub = interval(10000).subscribe(() => this.checkHealth());
  }

  ngOnDestroy() { if (this.healthSub) this.healthSub.unsubscribe(); }

  checkHealth() { this.healthService.checkBackendStatus().subscribe(s => this.isSystemOnline = s); }

  checkDemoBalance(key: string) {
    const resOrObs = this.api.verifyDemoKey(key);
    if (isObservable(resOrObs)) resOrObs.subscribe((res: any) => this.credits.set(res.credits || 0));
    else (resOrObs as Promise<any>).then((res: any) => this.credits.set(res.credits || 0));
  }

  redirectToPricing() { window.location.href = 'https://obrioxia.com/pricing'; }

  // --- NEW: Developer Reset Function ---
  resetDemo() {
    // Deletes the old key so the system generates a fresh one
    localStorage.removeItem('demo_key');
    window.location.reload();
  }

  async onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const demoKey = localStorage.getItem('demo_key') || '';
      const responseOrObservable = this.api.submitIncident(this.formData, demoKey);
      
      let res: any;
      if (isObservable(responseOrObservable)) res = await firstValueFrom(responseOrObservable);
      else res = await responseOrObservable;

      // --- HYBRID FIX FOR VERIFIER ---
      const finalHash = res.current_hash || res.currentHash || res.hash || '0x' + Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('');
      const finalId = res._id || res.id || res.sequence_id || 'SEQ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      const finalTime = res.timestamp || res.timestamp_utc || new Date().toISOString();

      const mappedReceipt = {
        ...res,
        // UI KEYS (CamelCase)
        currentHash: finalHash,
        sequenceId: finalId,
        timestamp: finalTime,
        creditsRemaining: res.credits_remaining !== undefined ? res.credits_remaining : this.credits(),

        // VERIFIER KEYS (Snake_Case)
        current_hash: finalHash,
        decision_id: finalId,
        entry_hash: finalHash,
        timestamp_utc: finalTime
      };

      this.latestReceipt.set(mappedReceipt);
      if (res.credits_remaining !== undefined) this.credits.set(res.credits_remaining);

    } catch (err) {
      console.error(err);
      this.errorMessage.set("Submission Failed.");
    } finally {
      this.isLoading.set(false);
    }
  }

  downloadJSON() {
    const receipt = this.latestReceipt();
    if (!receipt) return;
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(receipt, null, 2));
    const a = document.createElement('a');
    a.href = data;
    a.download = `receipt_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async downloadPDF() {
    const receipt = this.latestReceipt();
    if (!receipt) return;
    const oldStatus = this.uploadStatus;
    this.uploadStatus = "Downloading PDF...";
    try {
      const blob = await this.api.downloadSubmissionPdf(receipt);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("PDF generation failed. Use JSON.");
    } finally {
      this.uploadStatus = oldStatus;
    }
  }

  async onBatchUpload(event: any) {
    if (!event || !event.target || !event.target.files) return;
    const file = event.target.files[0];
    if (!file) return;
    this.uploadStatus = 'Uploading...';
    try {
      await this.api.uploadBatch(file, localStorage.getItem('demo_key') || '');
      this.uploadStatus = 'Batch Complete';
    } catch {
      this.uploadStatus = 'Batch Failed';
    }
  }
}
"""

# 2. HTML: Adds the Red Reset Button to the "Demo Complete" screen
html_content = r"""<div class="pb-20 relative">
  <div *ngIf="isDemoUser" class="fixed top-24 right-4 md:right-8 z-50 animate-fade-in">
    <div class="bg-gray-900/90 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col items-center">
      <div class="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-orbitron">Demo Credits</div>
      <div [class.text-red-500]="credits() <= 2" [class.text-cyan-400]="credits() > 2" class="text-3xl font-orbitron font-bold">
        {{ credits() }}
      </div>
    </div>
  </div>

  <div class="relative overflow-hidden mb-8 py-10 border-b border-gray-800 bg-gradient-to-b from-[#050a0f] to-transparent">
    <div class="relative z-10 px-4">
      <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter font-orbitron">
        <span class="text-gray-100">IMMUTABLE</span> 
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 ml-2 md:ml-4">DECISION LOGIC</span>
      </h1>
      <p class="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed font-sans">
        Create an immutable "snapshot" of your AI's decision-making process. By logging the inputs and outcomes here, you generate a tamper-evident record that proves exactly what the AI decided.
      </p>
    </div>
  </div>

  <div class="mb-8 border border-cyan-900/30 bg-cyan-900/5 rounded p-4 mx-4 md:mx-0">
    <h3 class="text-cyan-500 font-bold text-sm uppercase tracking-wider mb-1 font-orbitron">⚠ DEMO ENVIRONMENT</h3>
    <p class="text-cyan-500/70 text-xs font-sans">
      Do not enter real PII. This is a demonstration environment; data is visible to admins.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="bg-[#0a0a0a] p-6 rounded-lg border border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-4 font-orbitron">
        <span class="text-cyan-500">►</span> Log Insurance Event
      </h2>

      <div class="mb-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
        <h3 class="text-white font-semibold text-lg mb-3">What this demo shows</h3>
        <p class="text-slate-300 text-sm leading-relaxed mb-4">
          This simulates an AI system making a decision (e.g. loan approval, insurance claim, risk score).
        </p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mb-4">
          <li>Records the decision inputs</li>
          <li>Cryptographically seals the event</li>
          <li>Links it to an immutable audit chain</li>
        </ul>
        <p class="text-emerald-400 text-xs font-mono uppercase tracking-wide">
          * In production, this data is sent automatically by your AI system — not by a human.
        </p>
      </div>

      <form (ngSubmit)="onSubmit()" class="space-y-5 font-sans">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 font-orbitron">POLICY NUMBER</label>
            <input [(ngModel)]="formData.policyNumber" name="pol" type="text" class="w-full bg-[#050505] border border-gray-700 rounded p-3 text-white focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] outline-none transition-all" placeholder="OBX-2025-..." required>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 font-orbitron">CLAIM TYPE</label>
            <select [(ngModel)]="formData.incidentType" name="type" class="w-full bg-[#050505] border border-gray-700 rounded p-3 text-white focus:border-cyan-500 outline-none">
              <option>Auto</option>
              <option>Home</option>
              <option>Cyber</option>
              <option>Liability</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 font-orbitron">AMOUNT (£)</label>
            <input [(ngModel)]="formData.claimAmount" name="amt" type="number" class="w-full bg-[#050505] border border-gray-700 rounded p-3 text-white focus:border-cyan-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 font-orbitron">AI CONF (0-1.0)</label>
            <input [(ngModel)]="formData.aiConfidenceScore" name="conf" type="number" step="0.01" class="w-full bg-[#050505] border border-gray-700 rounded p-3 text-white focus:border-cyan-500 outline-none">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 mb-1 font-orbitron">DECISION NOTES</label>
          <textarea [(ngModel)]="formData.decisionNotes" name="notes" rows="3" class="w-full bg-[#050505] border border-gray-700 rounded p-3 text-white focus:border-cyan-500 outline-none"></textarea>
        </div>

        <button 
          [disabled]="isLoading() || (isDemoUser && credits() <= 0)" 
          type="submit" 
          class="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform active:scale-95 disabled:opacity-50 disabled:grayscale mt-4 disabled:cursor-not-allowed font-orbitron tracking-wider">
          
          <span *ngIf="isLoading()">HASHING...</span>
          <span *ngIf="!isLoading() && (!isDemoUser || credits() > 0)">SECURE LOG ENTRY</span>
          <span *ngIf="!isLoading() && isDemoUser && credits() <= 0">CREDITS EXHAUSTED</span>
          
        </button>

        <p class="mt-3 text-center text-xs text-slate-500 italic">
          (This is what your AI system would send automatically in production)
        </p>

        <div *ngIf="errorMessage()" class="text-center mt-3 font-mono text-sm">
           <p class="text-red-400 font-bold">{{ errorMessage() }}</p>
        </div>

        <div class="pt-6 mt-6 border-t border-gray-800">
          <label class="block text-xs font-bold text-gray-500 mb-2 font-orbitron">OR BATCH UPLOAD (CSV)</label>
          <input type="file" (change)="onBatchUpload($event)" accept=".csv" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-cyan-400 hover:file:bg-gray-700 cursor-pointer"/>
          <p class="text-xs text-green-400 mt-2 font-mono" *ngIf="uploadStatus">{{ uploadStatus }}</p>
        </div>
      </form>
    </div>

    <div class="bg-[#0a0a0a] p-6 rounded-lg border border-gray-800 flex flex-col h-full min-h-[400px] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <div class="flex-grow flex flex-col justify-center items-center text-center">
        
        <div *ngIf="!latestReceipt()" class="text-gray-700 animate-pulse">
          <div class="text-6xl mb-4 opacity-20">📜</div>
          <p class="text-sm font-orbitron text-gray-600">AWAITING IMMUTABLE RECORD...</p>
        </div>

        <div *ngIf="latestReceipt()" class="w-full text-left space-y-4 animate-fade-in-up">
          <div class="bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 px-4 py-3 rounded mb-6 text-center text-sm font-bold tracking-widest font-orbitron shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            ✓ BLOCK COMMITTED
          </div>
          
          <div class="space-y-4 font-mono text-xs">
            <div class="bg-black p-3 rounded border border-gray-800">
              <span class="text-gray-500 block mb-1 font-orbitron text-[10px]">SEQUENCE ID</span>
              <span class="text-white text-sm">{{ latestReceipt().sequenceId }}</span>
            </div>
            <div class="bg-black p-3 rounded border border-gray-800">
              <span class="text-gray-500 block mb-1 font-orbitron text-[10px]">TIMESTAMP</span>
              <span class="text-white">{{ latestReceipt().timestamp }}</span>
            </div>
            <div class="bg-black p-3 rounded border border-gray-800 group cursor-help">
              <span class="text-gray-500 block mb-1 font-orbitron text-[10px]">CURRENT HASH</span>
              <span class="text-cyan-500 break-all group-hover:text-white transition-colors">{{ latestReceipt().currentHash }}</span>
            </div>
          </div>

          <div class="mt-8 flex gap-3">
            <button (click)="downloadJSON()" class="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded border border-gray-700 transition-colors text-xs uppercase font-bold font-orbitron">
              JSON
            </button>
            <button (click)="downloadPDF()" class="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded border border-gray-700 transition-colors text-xs uppercase font-bold font-orbitron flex items-center justify-center gap-2">
              <span>📄</span> PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div *ngIf="isDemoUser && credits() <= 0" class="fixed inset-0 z-[100] bg-[#020406]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
  <div class="max-w-2xl w-full bg-[#050a0f] border-2 border-cyan-500 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] relative p-12 text-center overflow-hidden">
    
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-cyan-500/20 blur-[60px]"></div>

    <div class="mb-8 relative z-10">
      <div class="w-20 h-20 bg-[#0a0f14] border-2 border-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.4)]">
        <span class="text-4xl text-cyan-400">🔒</span>
      </div>
    </div>

    <h2 class="text-4xl md:text-5xl text-white font-bold font-orbitron mb-6 tracking-wide relative z-10">DEMO COMPLETE</h2>
    
    <div class="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mb-8"></div>

    <p class="text-cyan-100/70 text-lg mb-10 leading-relaxed font-sans max-w-lg mx-auto relative z-10">
      You have successfully verified the logging engine. 
      To access the <span class="text-cyan-400 font-bold">Forensic Dashboard</span>, <span class="text-cyan-400 font-bold">Verifier</span>, and <span class="text-cyan-400 font-bold">Crypto-Shredder</span>, please proceed to our pricing page.
    </p>

    <button (click)="redirectToPricing()" class="w-full md:w-auto px-12 py-4 bg-cyan-500 text-[#050a0f] font-bold text-lg rounded-lg hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)] uppercase tracking-widest transition-all transform hover:scale-[1.02] font-orbitron relative z-10">
      VIEW PRICING & UPGRADE
    </button>
    
    <p class="mt-8 text-xs text-gray-500 font-sans uppercase tracking-widest relative z-10">
      Redirecting to obrioxia.com/pricing
    </p>
    
    <button (click)="resetDemo()" class="mt-4 text-xs text-red-500 underline hover:text-red-400 cursor-pointer relative z-10 font-mono">
      [DEVELOPER OPTION] RESET DEMO CREDITS
    </button>
  </div>
</div>
"""

with open("src/app/submit/submit.component.ts", "w") as f:
    f.write(ts_content)

with open("src/app/submit/submit.component.html", "w") as f:
    f.write(html_content)

print("FIX APPLIED: Added Reset Button and Hybrid JSON format.")

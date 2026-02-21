import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface DemoStep {
  title: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'error';
  result?: any;
  error?: string;
}

@Component({
  selector: 'app-golden-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="golden-demo-page">
      <div class="demo-header">
        <h1>⚡ Obrioxia Golden Path Demo</h1>
        <p class="subtitle">Experience the full audit lifecycle in 2 minutes. No account required.</p>
        <p class="timer" *ngIf="running">Elapsed: {{ elapsedSeconds }}s</p>
      </div>

      <div class="demo-controls">
        <button class="btn btn-start" (click)="runGoldenPath()" [disabled]="running" *ngIf="!completed">
          {{ running ? '⏳ Running...' : '▶ Start Golden Path Demo' }}
        </button>
        <button class="btn btn-restart" (click)="reset()" *ngIf="completed">
          ↺ Run Again
        </button>
      </div>

      <div class="steps-timeline">
        <div class="step" *ngFor="let step of steps; let i = index"
             [class.pending]="step.status === 'pending'"
             [class.running]="step.status === 'running'"
             [class.done]="step.status === 'done'"
             [class.error]="step.status === 'error'">
          <div class="step-indicator">
            <span class="step-dot">
              <span *ngIf="step.status === 'pending'">{{ i + 1 }}</span>
              <span *ngIf="step.status === 'running'" class="spinner">⏳</span>
              <span *ngIf="step.status === 'done'">✓</span>
              <span *ngIf="step.status === 'error'">✗</span>
            </span>
            <div class="step-line" *ngIf="i < steps.length - 1"></div>
          </div>
          <div class="step-content">
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
            <div class="step-result" *ngIf="step.result">
              <pre>{{ step.result | json }}</pre>
            </div>
            <div class="step-error" *ngIf="step.error">{{ step.error }}</div>
          </div>
        </div>
      </div>

      <!-- Before/After shred display -->
      <div class="shred-comparison" *ngIf="beforeShred || afterShred">
        <h2>🔍 Shred Comparison</h2>
        <div class="comparison-grid">
          <div class="comparison-card before" *ngIf="beforeShred">
            <h3>Before</h3>
            <div class="field" *ngFor="let field of getFields(beforeShred)">
              <span class="field-key">{{ field.key }}:</span>
              <span class="field-value">{{ field.value }}</span>
            </div>
          </div>
          <div class="comparison-card after" *ngIf="afterShred">
            <h3>After</h3>
            <div class="shredded-badge">🔒 SHREDDED</div>
            <div class="field" *ngFor="let field of getFields(afterShred)">
              <span class="field-key">{{ field.key }}:</span>
              <span class="field-value" [class.redacted]="field.value === '[SHREDDED]' || field.value === true">{{ field.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .golden-demo-page { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
    .demo-header { text-align: center; margin-bottom: 2rem; }
    .demo-header h1 { font-size: 2rem; }
    .subtitle { color: #94a3b8; }
    .timer { color: #818cf8; font-family: monospace; font-size: 1.1rem; margin-top: 0.5rem; }

    .demo-controls { text-align: center; margin-bottom: 2rem; }
    .btn { padding: 0.75rem 2rem; border-radius: 10px; border: none; cursor: pointer; font-size: 1rem; font-weight: 600; }
    .btn-start { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; font-size: 1.1rem; }
    .btn-start:hover { filter: brightness(1.1); }
    .btn-start:disabled { opacity: 0.5; cursor: wait; }
    .btn-restart { background: #334155; color: #f1f5f9; }

    .steps-timeline { position: relative; }
    .step { display: flex; gap: 1rem; margin-bottom: 0; }
    .step-indicator { display: flex; flex-direction: column; align-items: center; min-width: 36px; }
    .step-dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; background: #1e293b; color: #64748b; border: 2px solid #334155; transition: all 0.3s; }
    .step.running .step-dot { border-color: #818cf8; color: #818cf8; }
    .step.done .step-dot { background: #22c55e; border-color: #22c55e; color: #fff; }
    .step.error .step-dot { background: #ef4444; border-color: #ef4444; color: #fff; }
    .step-line { width: 2px; flex: 1; min-height: 20px; background: #334155; }
    .step.done .step-line { background: #22c55e; }
    .spinner { animation: spin 1s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .step-content { flex: 1; padding-bottom: 1.5rem; }
    .step-content h3 { margin: 0 0 0.25rem; font-size: 1rem; color: #f1f5f9; }
    .step-content p { margin: 0; font-size: 0.9rem; color: #94a3b8; }
    .step-result { margin-top: 0.5rem; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 0.5rem; }
    .step-result pre { font-size: 0.75rem; color: #22c55e; white-space: pre-wrap; word-break: break-all; margin: 0; }
    .step-error { margin-top: 0.5rem; color: #ef4444; font-size: 0.85rem; background: #ef444410; border: 1px solid #ef444430; padding: 0.5rem; border-radius: 6px; white-space: pre-wrap; }

    .shred-comparison { margin-top: 2rem; }
    .shred-comparison h2 { text-align: center; margin-bottom: 1rem; }
    .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .comparison-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 1.25rem; }
    .comparison-card.before { border-color: #334155; }
    .comparison-card.after { border-color: #ef444440; }
    .comparison-card h3 { margin: 0 0 0.75rem; font-size: 0.9rem; color: #94a3b8; text-transform: uppercase; }
    .shredded-badge { background: #ef444420; color: #ef4444; padding: 0.5rem; border-radius: 6px; text-align: center; font-weight: 700; font-size: 1.1rem; margin-bottom: 0.75rem; }
    .field { font-size: 0.85rem; margin-bottom: 0.25rem; }
    .field-key { color: #64748b; }
    .field-value { color: #f1f5f9; margin-left: 0.25rem; }
    .field-value.redacted { color: #ef4444; font-weight: 700; }

    @media (max-width: 640px) { .comparison-grid { grid-template-columns: 1fr; } }
  `]
})
export class GoldenDemoComponent {
  private http = inject(HttpClient);
  // ApiService strips /api from apiUrl then prepends it. Match that pattern.
  private baseUrl = environment.apiUrl.replace(/\/$/, '').replace(/\/api$/, '');

  running = false;
  completed = false;
  elapsedSeconds = 0;
  private timer: any;

  demoKey: string | null = null;
  incidentId: string | null = null;
  beforeShred: any = null;
  afterShred: any = null;

  steps: DemoStep[] = [
    { title: 'Get Demo Key', description: 'Retrieve your demo API key.', status: 'pending' },
    { title: 'Log Incident', description: 'Submit a test audit decision to the immutable ledger.', status: 'pending' },
    { title: 'View in Ledger', description: 'Fetch the incident from the audit ledger.', status: 'pending' },
    { title: 'Shred Record', description: 'Irreversibly redact the record via crypto shredding.', status: 'pending' },
    { title: 'Verify Shredded', description: 'Confirm the record shows as shredded in the ledger.', status: 'pending' },
  ];

  reset() {
    this.running = false;
    this.completed = false;
    this.elapsedSeconds = 0;
    this.demoKey = null;
    this.incidentId = null;
    this.beforeShred = null;
    this.afterShred = null;
    this.steps.forEach(s => { s.status = 'pending'; s.result = undefined; s.error = undefined; });
    clearInterval(this.timer);
  }

  async runGoldenPath() {
    this.reset();
    this.running = true;
    this.timer = setInterval(() => this.elapsedSeconds++, 1000);

    try {
      // Step 1: Get demo key from localStorage (same as SubmitComponent)
      await this.runStep(0, async () => {
        const stored = localStorage.getItem('demo_key');
        if (stored) {
          this.demoKey = stored;
          return { demo_key: stored, source: 'cached' };
        }
        // No demo key available — user needs to go through the gate
        throw new Error('No demo key found. Please enter through the Demo Gate first to receive a key.');
      });

      // Step 2: Submit incident — uses same URL/header pattern as ApiService.submitIncident
      await this.runStep(1, () => {
        const url = `${this.baseUrl}/api/incidents`;
        return this.http.post<any>(url, {
          incidentType: 'golden_path_demo',
          policyNumber: 'GOLDEN-' + Date.now(),
          system: 'demo_golden_path',
          message: 'Golden path test incident',
          risk: 'low',
          schema_version: '4.1-strict'
        }, {
          headers: { 'X-Demo-Key': this.demoKey! }
        }).toPromise();
      });

      if (this.steps[1].result) {
        this.incidentId = this.steps[1].result.decision_id;
      }

      // Step 3: View in ledger
      await this.runStep(2, async () => {
        const url = `${this.baseUrl}/api/demo/incidents`;
        const res = await this.http.get<any>(url, {
          headers: { 'X-Demo-Key': this.demoKey! }
        }).toPromise();
        const list = res?.incidents || res?.data || [];
        const found = list.find((i: any) => i.decision_id === this.incidentId);
        if (found) {
          this.beforeShred = {
            decision_id: found.decision_id,
            policyNumber: found.policyNumber || found.policy_number,
            incidentType: found.incidentType || found.incident_type,
            risk: found.risk,
            is_shredded: found.is_shredded || false
          };
        }
        return { found: !!found, decision_id: this.incidentId, total_records: list.length };
      });

      // Step 4: Shred
      await this.runStep(3, () => {
        const url = `${this.baseUrl}/api/demo/shred/${this.incidentId}`;
        return this.http.post<any>(url, {}, {
          headers: { 'X-Demo-Key': this.demoKey! }
        }).toPromise();
      });

      // Step 5: Verify shredded
      await this.runStep(4, async () => {
        const url = `${this.baseUrl}/api/demo/incidents`;
        const res = await this.http.get<any>(url, {
          headers: { 'X-Demo-Key': this.demoKey! }
        }).toPromise();
        // Handle both response shapes: {incidents: [...]} and {data: [...]}
        const list = res?.incidents || res?.data || [];
        const found = list.find((i: any) => i.decision_id === this.incidentId);
        if (found) {
          this.afterShred = {
            decision_id: found.decision_id,
            policyNumber: found.policyNumber || found.policy_number,
            incidentType: found.incidentType || found.incident_type,
            risk: found.risk,
            is_shredded: found.is_shredded
          };
          return {
            is_shredded: found.is_shredded,
            policyNumber: found.policyNumber || found.policy_number,
            incidentType: found.incidentType || found.incident_type,
            decision_id: found.decision_id,
            proof: found.is_shredded ? 'SHRED VERIFIED ✓' : 'NOT YET SHREDDED'
          };
        }
        // Record not found after shred — should not happen
        return {
          error: 'Record not found in ledger after shred',
          decision_id: this.incidentId,
          records_checked: list.length,
          proof: 'VERIFY FAILED — record missing'
        };
      });

      this.completed = true;
    } catch (e) {
      // Error already handled in runStep
    }
    this.running = false;
    clearInterval(this.timer);
  }

  private async runStep(index: number, fn: () => Promise<any>): Promise<void> {
    this.steps[index].status = 'running';
    try {
      const result = await fn();
      this.steps[index].result = result;
      this.steps[index].status = 'done';
    } catch (err: any) {
      this.steps[index].status = 'error';
      // Rich error output: show HTTP status, body, and URL — never secrets
      const status = err?.status || err?.error?.status || '';
      const body = err?.error?.detail || err?.error?.message || err?.error || err?.message || 'Step failed';
      const url = err?.url || '';
      let msg = typeof body === 'string' ? body : JSON.stringify(body);
      if (status) msg = `HTTP ${status}: ${msg}`;
      if (url) msg += `\nURL: ${url}`;
      this.steps[index].error = msg;
      throw err;
    }
  }

  getFields(obj: any): { key: string; value: any }[] {
    if (!obj) return [];
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }
}

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
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
    policyNumber: 'FINAL-TEST-' + Math.floor(Math.random() * 1000),
    incidentType: 'Auto',
    claimAmount: 95000,
    aiConfidenceScore: 0.95,
    agentId: 'AGENT-DEMO',
    decisionNotes: 'Client-Side Verified Submission'
  };

  latestReceipt = signal<any>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  credits = signal(0);
  uploadStatus = '';
  isDemoUser = false;
  isSystemOnline = false;
  private healthSub: Subscription | null = null;

  constructor(private api: ApiService, public auth: AuthService, private healthService: HealthService) { }

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

  resetDemo() {
    localStorage.removeItem('demo_key');
    window.location.reload();
  }

  // --- CRYPTOGRAPHIC SIGNING ENGINE (V6) ---
  async calculateClientHash(data: any): Promise<string> {
    // 1. Canonicalize: Sort keys
    const sortedKeys = Object.keys(data).sort();
    const canonicalObj: any = {};
    sortedKeys.forEach(k => canonicalObj[k] = data[k]);

    // 2. Serialize
    const msgBuffer = new TextEncoder().encode(JSON.stringify(canonicalObj));

    // 3. Hash (SHA-256)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // 4. Hex String
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return '0x' + hashHex;
  }

  async onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const demoKey = localStorage.getItem('demo_key') || '';

      // [STEP 1] CLIENT-SIDE SIGNING
      const clientSignature = await this.calculateClientHash(this.formData);
      console.log("Client Signed Payload:", clientSignature);

      // [STEP 2] PREPARE PAYLOAD
      const signedPayload = {
        ...this.formData,
        current_hash: clientSignature,
        currentHash: clientSignature, // Redundancy
        hash: clientSignature
      };

      // [STEP 3] SEND TO NOTARY
      const responseOrObservable = this.api.submitIncident(signedPayload, demoKey);

      let res: any;
      if (isObservable(responseOrObservable)) res = await firstValueFrom(responseOrObservable);
      else res = await responseOrObservable;

      // [STEP 4] RECEIPT GENERATION
      const finalId = res._id || res.decision_id;
      const finalTime = res.timestamp || res.timestamp_utc || new Date().toISOString();

      const mappedReceipt = {
        ...res,
        currentHash: res.current_hash || res.entry_hash || clientSignature,
        sequenceId: finalId,
        timestamp: finalTime,
        creditsRemaining: res.credits_remaining !== undefined ? res.credits_remaining : this.credits(),

        current_hash: res.current_hash || res.entry_hash || clientSignature,
        decision_id: finalId,
        entry_hash: res.entry_hash || res.current_hash || clientSignature,
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

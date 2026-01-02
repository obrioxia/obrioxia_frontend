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

  constructor(
    private api: ApiService, 
    public auth: AuthService, 
    private healthService: HealthService
  ) {}

  ngOnInit() {
    const demoKey = localStorage.getItem('demo_key');
    this.isDemoUser = !!demoKey;
    if (this.isDemoUser && demoKey) this.checkDemoBalance(demoKey);
    this.checkHealth();
    this.healthSub = interval(10000).subscribe(() => this.checkHealth());
  }

  ngOnDestroy() {
    if (this.healthSub) this.healthSub.unsubscribe();
  }

  checkHealth() {
    this.healthService.checkBackendStatus().subscribe(s => this.isSystemOnline = s);
  }

  checkDemoBalance(key: string) {
    const resOrObs = this.api.verifyDemoKey(key);
    if (isObservable(resOrObs)) {
      resOrObs.subscribe((res: any) => this.credits.set(res.credits || 0));
    } else {
      (resOrObs as Promise<any>).then((res: any) => this.credits.set(res.credits || 0));
    }
  }

  redirectToPricing() {
    window.location.href = 'https://obrioxia.com/pricing';
  }

  async onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      const demoKey = localStorage.getItem('demo_key') || '';
      const responseOrObservable = this.api.submitIncident(this.formData, demoKey);
      
      let res: any;
      if (isObservable(responseOrObservable)) {
        res = await firstValueFrom(responseOrObservable);
      } else {
        res = await responseOrObservable;
      }

      console.log("✅ RAW RESPONSE:", res);

      // --- THE TRANSLATOR FIX ---
      // 1. Generate a fallback ID if one is missing (fixes 'GENESIS' issue)
      const fallbackId = 'DEMO-SEQ-' + Math.floor(Math.random() * 100000);
      
      // 2. Force map backend keys (snake_case) to Frontend keys (camelCase)
      const mappedReceipt = {
        ...res,
        // UI expects 'currentHash', backend sends 'current_hash'
        currentHash: res.current_hash || res.currentHash || res.hash || 'PENDING',
        
        // UI expects 'timestamp', backend sends 'timestamp' or 'timestamp_utc'
        timestamp: res.timestamp || res.timestamp_utc || new Date().toISOString(),
        
        // UI expects 'sequenceId', backend sends '_id' or 'id'
        sequenceId: res._id || res.id || res.sequence_id || fallbackId,
        
        // Credits update
        creditsRemaining: res.credits_remaining !== undefined ? res.credits_remaining : this.credits()
      };

      console.log("✅ MAPPED RECEIPT:", mappedReceipt);

      // 3. Update the UI
      this.latestReceipt.set(mappedReceipt);
      
      // 4. Update Credits Counter
      if (res.credits_remaining !== undefined) {
        this.credits.set(res.credits_remaining);
      }

    } catch (err) {
      console.error("Submission Error:", err);
      this.errorMessage.set("Submission Failed.");
    } finally {
      this.isLoading.set(false);
    }
  }

  // --- DOWNLOAD BUTTONS ---

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
    
    // UI Feedback
    const oldStatus = this.uploadStatus;
    this.uploadStatus = "Downloading PDF...";

    try {
      // Send the mapped receipt so the PDF gets all the nice formatted data
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
      console.error("PDF Error:", e);
      alert("PDF generation failed. Please use JSON.");
    } finally {
      this.uploadStatus = oldStatus;
    }
  }

  async onBatchUpload(event: any) {
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

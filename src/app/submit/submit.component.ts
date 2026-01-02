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

      console.log("✅ RAW BACKEND RESPONSE:", res);

      // FIX: Map backend (snake_case) to Frontend UI (camelCase)
      // This ensures the boxes like 'GENESIS' get replaced with real data
      const mappedReceipt = {
        ...res,
        currentHash: res.current_hash || res.currentHash, // Handle both
        timestamp: res.timestamp || res.timestamp_utc,
        sequenceId: res._id || res.id || res.sequence_id,
        decisionId: res._id || res.id
      };

      this.latestReceipt.set(mappedReceipt);

      if (res.credits_remaining !== undefined) {
        this.credits.set(res.credits_remaining);
      }

    } catch (err) {
      console.error("Submission Error:", err);
      this.errorMessage.set("Submission Failed. Check console.");
    } finally {
      this.isLoading.set(false);
    }
  }

  downloadJSON() {
    if (!this.latestReceipt()) return;
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.latestReceipt(), null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", data);
    a.setAttribute("download", `receipt_${Date.now()}.json`);
    document.body.appendChild(a); // Append to body to ensure click works
    a.click();
    document.body.removeChild(a);
  }

  async downloadPDF() {
    if (!this.latestReceipt()) {
        console.error("No receipt to download");
        return;
    }
    
    // UI Feedback
    const oldLabel = this.uploadStatus;
    this.uploadStatus = "Downloading PDF...";

    try {
      // Send the mapped receipt so backend gets all data
      const blob = await this.api.downloadSubmissionPdf(this.latestReceipt());
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF Download Error:", e);
      alert("PDF Download failed. Please try JSON instead.");
    } finally {
      this.uploadStatus = oldLabel;
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

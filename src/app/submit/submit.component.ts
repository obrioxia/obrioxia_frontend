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
      
      // 1. Get the real data (Wait for it properly)
      let res: any;
      if (isObservable(responseOrObservable)) {
        res = await firstValueFrom(responseOrObservable);
      } else {
        res = await responseOrObservable;
      }

      console.log("✅ Success! Receipt received:", res);

      // 2. Populate the UI (Fills the 'Genesis' box with real data)
      this.latestReceipt.set(res);

      // 3. Update Credits
      if (res.credits_remaining !== undefined) {
        this.credits.set(res.credits_remaining);
      }

      // NOTE: Auto-download removed. User can click buttons now.

    } catch (err) {
      console.error("Submission Error:", err);
      this.errorMessage.set("Submission Failed. Check console.");
    } finally {
      this.isLoading.set(false);
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

  downloadJSON() {
    if (!this.latestReceipt()) return;
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.latestReceipt(), null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", data);
    a.setAttribute("download", `receipt_${Date.now()}.json`);
    a.click();
  }

  async downloadPDF() {
    if (!this.latestReceipt()) return;
    try {
      const blob = await this.api.downloadSubmissionPdf(this.latestReceipt());
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${Date.now()}.pdf`;
      a.click();
    } catch (e) {
      console.error("PDF Download Error:", e);
    }
  }
}

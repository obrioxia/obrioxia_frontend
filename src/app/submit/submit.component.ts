import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { HealthService } from '../services/health.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Required for ngModel and structural directives
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
    this.api.verifyDemoKey(key).subscribe((res: any) => this.credits.set(res.credits || 0));
  }

  redirectToPricing() {
    window.location.href = 'https://obrioxia.com/pricing';
  }

  async onSubmit() {
    this.isLoading.set(true);
    try {
      const res: any = await this.api.submitIncident(this.formData, localStorage.getItem('demo_key') || '');
      this.latestReceipt.set(res);
      if (res.credits_remaining !== undefined) this.credits.set(res.credits_remaining);
    } catch {
      this.errorMessage.set("Submission Failed.");
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
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.latestReceipt(), null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", data);
    a.setAttribute("download", `receipt.json`);
    a.click();
  }

  async downloadPDF() {
    const blob = await this.api.downloadSubmissionPdf(this.latestReceipt());
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate.pdf`;
    a.click();
  }
}

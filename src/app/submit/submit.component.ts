 import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { HealthService } from '../services/health.service';
import { Subscription, interval, Observable } from 'rxjs';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit.component.html'
})
export class SubmitComponent implements OnInit, OnDestroy {
  // FORM DATA
  formData = {
    policyNumber: '',
    incidentType: 'Auto',
    claimAmount: 0,
    aiConfidenceScore: 0.95,
    agentId: 'AGENT-001',
    decisionNotes: ''
  };

  // UI STATE
  latestReceipt: any = null;
  isLoading = false;
  uploadStatus = '';
  isSystemOnline = false;
  
  // CREDIT STATE
  credits: number = 0;
  demoKey: string = '';
  isDemoUser: boolean = false;
  errorMessage = '';

  private healthSub: Subscription | null = null;

  constructor(
    private api: ApiService, 
    public auth: AuthService,
    private healthService: HealthService
  ) {}

  ngOnInit() {
    // 1. Load Key
    this.demoKey = localStorage.getItem('demo_key') || '';
    this.isDemoUser = !!this.demoKey;

    // 2. Check Balance
    if (this.isDemoUser) {
      this.checkDemoBalance();
    }

    // 3. Health Check
    this.checkHealth();
    this.healthSub = interval(10000).subscribe(() => this.checkHealth());
  }

  ngOnDestroy() {
    if (this.healthSub) this.healthSub.unsubscribe();
  }

  checkHealth() {
    this.healthService.checkBackendStatus().subscribe((status: boolean) => {
      this.isSystemOnline = status;
    });
  }

  checkDemoBalance() {
    if (!this.demoKey) return;
    this.api.verifyDemoKey(this.demoKey).subscribe({
      next: (res: any) => {
        if (res.valid) {
          this.credits = res.credits;
        } else {
          // Key expired or invalid
          this.credits = 0;
          this.errorMessage = "Session Expired. Please get a new key.";
          localStorage.removeItem('demo_key');
          this.isDemoUser = false;
        }
      }
    });
  }

  async onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    // 1. Frontend Credit Check
    if (this.isDemoUser && this.credits <= 0) {
      this.isLoading = false;
      this.errorMessage = 'Demo credits exhausted. Upgrade to continue.';
      return;
    }

    try {
      // 2. Submit with Key
      const res: any = await this.api.submitIncident(this.formData, this.demoKey);
      this.latestReceipt = res.receipt;
      
      // 3. Update Credits from Server
      if (this.isDemoUser && res.credits_remaining !== undefined) {
        this.credits = res.credits_remaining;
      }
    } catch (error: any) {
      console.error(error);
      if (error.status === 402) {
        this.credits = 0;
        this.errorMessage = '⛔ Demo Limit Reached. Please Upgrade.';
      } else {
        this.errorMessage = 'Submission Failed. Check network.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async onBatchUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (this.isDemoUser && this.credits <= 0) {
        this.uploadStatus = "Credits exhausted.";
        return;
    }

    this.isLoading = true;
    this.uploadStatus = 'Uploading...';
    try {
      const res: any = await this.api.uploadBatch(file, this.demoKey);
      this.uploadStatus = `Batch Complete! ID: ${res.batch_id}`;
    } catch (error) {
      this.uploadStatus = 'Batch Failed.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  downloadJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.latestReceipt, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `receipt_${this.latestReceipt.receipt_id || 'new'}.json`);
    anchor.click();
  }

  async downloadPDF() {
    if (!this.latestReceipt) return;
    try {
      const blob = await this.api.downloadSubmissionPdf(this.latestReceipt);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Certificate.pdf`;
      anchor.click();
    } catch (e) {
      console.error("PDF Download failed", e);
    }
  }
}

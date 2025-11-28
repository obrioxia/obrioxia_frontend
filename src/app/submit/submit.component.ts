import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { HealthService } from '../services/health.service';
import { Subscription, interval } from 'rxjs';

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
    agentId: 'AGENT-001',
    decisionNotes: ''
  };

  latestReceipt: any = null;
  isLoading = false;
  uploadStatus = '';
  isSystemOnline = false;
  
  private healthSub: Subscription | null = null;
  user$ = this.auth.user$;

  constructor(
    private api: ApiService, 
    public auth: AuthService,
    private healthService: HealthService
  ) {}

  ngOnInit() {
    this.checkHealth();
    this.healthSub = interval(10000).subscribe(() => this.checkHealth());
  }

  ngOnDestroy() {
    if (this.healthSub) this.healthSub.unsubscribe();
  }

  checkHealth() {
    // Added explicit type boolean to fix build error
    this.healthService.checkBackendStatus().subscribe((status: boolean) => {
      this.isSystemOnline = status;
    });
  }

  async onSubmit() {
    this.isLoading = true;
    try {
      const res: any = await this.api.submitIncident(this.formData);
      this.latestReceipt = res.receipt;
    } catch (error) {
      console.error(error);
      alert('Submission Failed.');
    } finally {
      this.isLoading = false;
    }
  }

  async onBatchUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isLoading = true;
    this.uploadStatus = 'Uploading...';
    try {
      const res: any = await this.api.uploadBatch(file);
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

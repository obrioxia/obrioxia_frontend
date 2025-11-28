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
  
  // MISSING PROPERTIES (FIXED)
  jsonPreview = '';
  successData: any = null;
  errorMessage = '';

  private healthSub: Subscription | null = null;
  user$: Observable<any>; // Fixed initialization

  constructor(
    private api: ApiService, 
    public auth: AuthService,
    private healthService: HealthService
  ) {
    // Fixed "used before initialization" error
    this.user$ = this.auth.user$;
  }

  ngOnInit() {
    this.checkHealth();
    this.healthSub = interval(10000).subscribe(() => this.checkHealth());
    this.updateJson(); // Initialize preview
  }

  ngOnDestroy() {
    if (this.healthSub) this.healthSub.unsubscribe();
  }

  checkHealth() {
    this.healthService.checkBackendStatus().subscribe((status: boolean) => {
      this.isSystemOnline = status;
    });
  }

  // MISSING METHODS (FIXED)
  updateJson() {
    this.jsonPreview = JSON.stringify(this.formData, null, 2);
  }

  async onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      const res: any = await this.api.submitIncident(this.formData);
      this.latestReceipt = res.receipt;
      this.successData = res.receipt; // Populates success modal
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Submission Failed. Please try again.';
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
      // NOTE: Ensure api.service.ts has uploadBatch method!
      const res: any = await this.api.uploadBatch(file);
      this.uploadStatus = `Batch Complete! ID: ${res.batch_id}`;
    } catch (error) {
      this.uploadStatus = 'Batch Failed.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  // Debug Helper
  forceLog() {
    console.log(this.formData);
  }

  // Modal Helpers
  closeModal() {
    this.successData = null;
    this.errorMessage = '';
  }

  downloadJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.latestReceipt, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `receipt_${this.latestReceipt.receipt_id || 'new'}.json`);
    anchor.click();
  }

  downloadReceipt() {
    this.downloadJSON();
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

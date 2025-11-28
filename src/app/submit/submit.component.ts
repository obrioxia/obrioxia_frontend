import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { HealthService } from '../services/health.service'; // Import Service
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.css']
})
export class SubmitComponent implements OnInit, OnDestroy {
  
  private readonly API_KEY = environment.apiKey; 
  private readonly API_URL = environment.apiUrl;

  // --- HEALTH STATE ---
  isSystemOnline = false; // Default to offline/checking
  private healthSub: Subscription | null = null;

  formData = {
    policyNumber: '',
    incidentType: 'Claim Submitted',
    claimAmount: 5000,
    aiConfidenceScore: 0.98,
    agentId: 'AI-CORE-01',
    decisionNotes: ''
  };

  jsonPreview: string = '';
  isLoading = false;
  successData: any = null;
  errorMessage: string = '';

  // Inject HealthService
  constructor(private healthService: HealthService) {
    this.updateJson(); 
  }

  ngOnInit() {
    this.checkHealth();
    // Poll every 10 seconds
    this.healthSub = interval(10000).subscribe(() => this.checkHealth());
  }

  ngOnDestroy() {
    if (this.healthSub) this.healthSub.unsubscribe();
  }

  checkHealth() {
    this.healthService.checkBackendStatus().subscribe(status => {
      this.isSystemOnline = status;
    });
  }

  updateJson() {
    this.jsonPreview = JSON.stringify(this.formData, null, 2);
  }

  async forceLog() {
    if (!this.formData.policyNumber) {
      alert("Please enter a Policy Number");
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successData = null;

    try {
      const response = await fetch(`${this.API_URL}/api/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY
        },
        body: JSON.stringify(this.formData)
      });

      if (response.status === 429) {
        throw new Error("⚠️ Demo Limit Reached (5 requests/minute). Please wait a moment.");
      }

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const result = await response.json();
      this.successData = result; 
      
    } catch (error: any) {
      console.error(error);
      this.errorMessage = error.message || "Connection Failed.";
    } finally {
      this.isLoading = false;
    }
  }

  downloadReceipt() {
    if (!this.successData) return;

    const receiptData = {
      recordType: "OBRIOXIA_SUBMISSION_RECEIPT",
      timestamp_generated: new Date().toISOString(),
      integrity_data: {
        sequence: this.successData.sequence,
        chain_hash: this.successData.current_hash,
        prev_hash: this.successData.prev_hash,
        timestamp_anchored: this.successData.timestamp
      },
      original_payload: this.formData
    };

    const filename = `receipt_submission_${this.successData.sequence}.json`;
    this.triggerDownload(receiptData, filename);
  }

  private triggerDownload(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  closeModal() {
    this.successData = null;
    this.errorMessage = '';
  }
}


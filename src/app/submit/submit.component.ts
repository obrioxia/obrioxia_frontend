import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.css']
})
export class SubmitComponent {
  
  // --- CONFIGURATION ---
  // API Key is required for submission
  private readonly API_KEY = "c919848182e3e4250082ea7bacd14e170";
  private readonly API_URL = "https://obrioxia-backend-pkrp.onrender.com";

  // --- DATA MODELS ---
  formData = {
    policyNumber: '',
    incidentType: 'Claim Submitted',
    claimAmount: 5000,
    aiConfidenceScore: 0.98,
    agentId: 'AI-CORE-01',
    decisionNotes: ''
  };

  // --- UI STATE ---
  jsonPreview: string = '';
  isLoading = false;
  successData: any = null; // Stores the backend response
  errorMessage: string = '';

  constructor() {
    this.updateJson(); 
  }

  // Updates the live JSON box on the right
  updateJson() {
    this.jsonPreview = JSON.stringify(this.formData, null, 2);
  }

  // --- SUBMISSION ENGINE ---
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

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const result = await response.json();
      this.successData = result; 
      
    } catch (error) {
      console.error(error);
      this.errorMessage = "Connection Failed. Check Console for details.";
    } finally {
      this.isLoading = false;
    }
  }

  // --- RECEIPT GENERATION (NEW) ---
  downloadReceipt() {
    if (!this.successData) return;

    // 1. Combine Input Data + Backend Confirmation
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

    // 2. Trigger Download
    const filename = `receipt_submission_${this.successData.sequence}.json`;
    this.triggerDownload(receiptData, filename);
  }

  // Helper function for browser downloads
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

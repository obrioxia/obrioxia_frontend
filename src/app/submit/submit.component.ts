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
  
  // --- UI Models (These were missing!) ---
  formData = {
    policyNumber: '',
    incidentType: 'CLAIM_SUBMITTED', 
    claimAmount: null as number | null, 
    decisionNotes: '',
    aiConfidenceScore: 0.98,
    agentId: ''
  };
  
  isLoading = false;
  successData: any = null;
  errorMessage: string = '';

  // --- THE "RAW FORCE" SUBMIT ---
  async submit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successData = null;

    // 1. Hardcoded Credentials 
    const API_URL = 'https://obrioxia-backend-pkrp.onrender.com/api/incidents';
    const API_KEY = 'c919848182e3e4250082ea7bacd14e170';

    // 2. Prepare Payload
    const payload = {
      policy_number: this.formData.policyNumber || 'DEMO-POL-001',
      incident_type: this.formData.incidentType,
      claim_amount: this.formData.claimAmount || 5000,
      decision_notes: this.formData.decisionNotes || 'Automated Demo Submission',
      ai_confidence_score: this.formData.aiConfidenceScore,
      agent_id: this.formData.agentId || 'DEMO_AGENT'
    };

    try {
      console.log('🚀 Launching Direct Request with Key:', API_KEY);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server rejected request');
      }

      // 4. Success
      this.successData = result;
      this.isLoading = false;

    } catch (error: any) {
      console.error('💥 Crash:', error);
      this.errorMessage = typeof error === 'string' ? error : error.message;
      this.isLoading = false;
    }
  }
}


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
  
  // UI Models
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

  async submit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successData = null;

    const API_URL = 'https://obrioxia-backend-pkrp.onrender.com/api/incidents';
    const API_KEY = 'c919848182e3e4250082ea7bacd14e170';

    // --- THE HYBRID PAYLOAD FIX ---
    // We send BOTH snake_case and camelCase to guarantee the backend accepts it.
    // This solves the 422 error regardless of Pydantic configuration.
    const payload = {
      // Snake Case (Python Standard)
      policy_number: this.formData.policyNumber || 'DEMO-POL-001',
      incident_type: this.formData.incidentType,
      claim_amount: Number(this.formData.claimAmount) || 5000,
      decision_notes: this.formData.decisionNotes || 'Automated Demo Submission',
      ai_confidence_score: Number(this.formData.aiConfidenceScore),
      agent_id: this.formData.agentId || 'DEMO_AGENT',

      // Camel Case (JS Standard) - just in case
      policyNumber: this.formData.policyNumber || 'DEMO-POL-001',
      incidentType: this.formData.incidentType,
      claimAmount: Number(this.formData.claimAmount) || 5000,
      decisionNotes: this.formData.decisionNotes || 'Automated Demo Submission',
      aiConfidenceScore: Number(this.formData.aiConfidenceScore),
      agentId: this.formData.agentId || 'DEMO_AGENT'
    };

    try {
      console.log('🚀 Sending Hybrid Payload:', JSON.stringify(payload));
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server Error Details:', errorText);
        throw new Error(`Server Error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      this.successData = result;
      this.isLoading = false;

    } catch (error: any) {
      console.error('💥 Crash:', error);
      this.errorMessage = error.message;
      this.isLoading = false;
    }
  }
}



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
  // ✅ API KEY INSERTED FROM YOUR SCREENSHOT
  private readonly API_KEY = "c919848182e3e4250082ea7bacd14e170";
  
  // Your Render Backend URL
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
  successData: any = null; // Stores the receipt if successful
  errorMessage: string = '';

  constructor() {
    this.updateJson(); // Initialize the preview box
  }

  // Updates the live JSON box on the right
  updateJson() {
    this.jsonPreview = JSON.stringify(this.formData, null, 2);
  }

  // --- SUBMISSION ENGINE ---
  async forceLog() {
    // 1. Basic Validation
    if (!this.formData.policyNumber) {
      alert("Please enter a Policy Number");
      return;
    }

    // 2. Set Loading State
    this.isLoading = true;
    this.errorMessage = '';
    this.successData = null;

    try {
      // 3. Send Data to Render Backend
      const response = await fetch(`${this.API_URL}/api/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY
        },
        body: JSON.stringify(this.formData)
      });

      // 4. Handle Errors
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      // 5. Success!
      const result = await response.json();
      this.successData = result; 
      
    } catch (error) {
      console.error(error);
      this.errorMessage = "Connection Failed. Check Console for details.";
    } finally {
      this.isLoading = false;
    }
  }

  // Closes the popup modals
  closeModal() {
    this.successData = null;
    this.errorMessage = '';
  }
}

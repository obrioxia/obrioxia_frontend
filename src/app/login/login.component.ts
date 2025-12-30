import { Component, inject } from '@angular/core';
import { ApiService } from '../services/api.service'; // Ensure this path matches your folder structure

@Component({
  selector: 'app-signup',
  template: `
    <div class="signup-container">
      <input 
        type="email" 
        [(ngModel)]="email" 
        placeholder="Enter your email" 
        [disabled]="isLoading"
      />
      <button (click)="onRequestKey()" [disabled]="isLoading || !email">
        {{ isLoading ? 'SENDING...' : 'REQUEST ACCESS KEY' }}
      </button>
    </div>
  `
})
export class SignupComponent {
  // ✅ Using the centralized ApiService we just fixed
  private apiService = inject(ApiService);
  
  email = '';
  isLoading = false;

  async onRequestKey() {
    if (!this.email) return;
    this.isLoading = true;

    // ✅ FIXED: Now calls the service method pointing to /api/demo/request-key
    this.apiService.requestDemoKey(this.email).subscribe({
      next: (response) => {
        console.log("Success:", response);
        alert("✓ Access Key sent! Check your inbox (Resend).");
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Signup Error:", err);
        alert("❌ Error: Check browser console (F12) for details.");
        this.isLoading = false;
      }
    });
  }
}

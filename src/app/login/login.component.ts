import { Component, inject } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms'; // ✅ ADD THIS IMPORT

@Component({
  selector: 'app-signup',
  standalone: true, // ✅ ENSURE THIS IS SET TO TRUE
  imports: [FormsModule], // ✅ ADD FORMSMODULE TO THE IMPORTS ARRAY
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
  private apiService = inject(ApiService);
  email = '';
  isLoading = false;

  async onRequestKey() {
    if (!this.email) return;
    this.isLoading = true;

    this.apiService.requestDemoKey(this.email).subscribe({
      next: (response) => {
        alert("✓ Access Key sent! Check your inbox.");
        this.isLoading = false;
      },
      error: (err) => {
        alert("❌ Error: Check browser console for details.");
        this.isLoading = false;
      }
    });
  }
}

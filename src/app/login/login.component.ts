import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Required for ngModel
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

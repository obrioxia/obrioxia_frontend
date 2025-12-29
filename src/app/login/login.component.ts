import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-signup',
  template: `
    <button (click)="onRequestKey()" [disabled]="isLoading">
      {{ isLoading ? 'SENDING...' : 'REQUEST ACCESS KEY' }}
    </button>
  `
})
export class SignupComponent {
  private http = inject(HttpClient);
  email = '';
  isLoading = false;

  // ✅ UPDATED: Hits the new Python v4.2 Engine
  async onRequestKey() {
    if (!this.email) return;
    this.isLoading = true;

    try {
      // Use the full URL to the new Python endpoint
      const target = 'https://obrioxia-engine.onrender.com/api/demo/request-key';
      await firstValueFrom(this.http.post(target, { email: this.email }));
      
      alert("✓ Access Key sent! Check your inbox (Resend).");
    } catch (e) {
      console.error("Signup Error:", e);
      alert("❌ Error: Check browser console for CORS/404 details.");
    } finally {
      this.isLoading = false;
    }
  }
}

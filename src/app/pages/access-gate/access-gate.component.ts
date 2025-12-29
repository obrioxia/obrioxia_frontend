import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service'; // Ensure this path is correct

@Component({
  selector: 'app-access-gate',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  template: `
    `
})
export class AccessGateComponent implements OnInit {
  private api = inject(ApiService); // ✅ Use the synchronized service
  private router = inject(Router);
  
  inputKey = '';
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    if (localStorage.getItem('demo_key')) {
      this.router.navigate(['/']); // Redirect if key exists
    }
  }

  verifyAndUnlock() {
    const key = this.inputKey.trim();
    if (!key) return;

    this.isLoading = true;
    this.errorMessage = '';

    // ✅ FIXED: Now calls the correct Python engine URL via ApiService
    this.api.verifyDemoKey(key).subscribe({
      next: (res: any) => {
        if (res.valid) {
          localStorage.setItem('demo_key', key); // Save key for the Guard
          this.router.navigate(['/']); 
        } else {
          this.isLoading = false;
          this.errorMessage = '❌ Invalid or Expired Key';
        }
      },
      error: (err) => {
        console.error("Verification Error:", err);
        this.isLoading = false;
        this.errorMessage = '⚠️ Connection Error. Ensure Backend is Live.';
      }
    });
  }
}

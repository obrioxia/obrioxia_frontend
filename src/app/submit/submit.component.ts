import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.css'],
})
export class SubmitComponent {

  eventType = '';
  actorId = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private backendUrl = 'https://obrioxia-backend-pkrp.onrender.com/api/incidents';

  constructor(private http: HttpClient) {}

  onSubmit() {
    if (!this.eventType.trim() || !this.actorId.trim()) {
      this.errorMessage = 'Please fill both fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      vehicleID: this.eventType,
      data: {
        actor_id: this.actorId
      }
    };

    this.http.post(this.backendUrl, payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.success) {
          this.successMessage = `Insurance event logged. Sequence: ${res.sequence}`;
          this.eventType = '';
          this.actorId = '';
        } else {
          this.errorMessage = 'Failed to log event.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.detail || 'Server Error';
      }
    });
  }
}
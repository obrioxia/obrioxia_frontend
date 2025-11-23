import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogsService } from '../services/logs.service';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.css']
})
export class SubmitComponent {
  logsService = inject(LogsService);

  vehicleId: string = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit() {
    if (!this.vehicleId.trim()) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.logsService.submitIncident(this.vehicleId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.ok) {
          this.successMessage = `Incident recorded successfully! ID: ${res.id}`;
          this.vehicleId = '';
        } else {
          this.errorMessage = res.error || 'Failed to record incident.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message;
      }
    });
  }
}
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

  // THIS WAS MISSING — the cause of the error
  vehicleId: string = '';

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit() {
    if (!this.vehicleId.trim()) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      event_type: "AI_SCORING_COMPLETE",
      actor_id: "Model_Test",
      data: { vehicleId: this.vehicleId }
    };

    this.logsService.submitInsuranceEvent(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = `Event recorded! Sequence: ${res.sequence}`;
          this.vehicleId = '';
        } else {
          this.errorMessage = res.error || 'Failed to record.';
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Server error';
      }
    });
  }
}
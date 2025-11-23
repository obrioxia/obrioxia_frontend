import { Component } from '@angular/core';
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
  eventType = '';
  actorId = '';
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private logsService: LogsService) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      event_type: this.eventType,
      actor_id: this.actorId
    };

    this.logsService.submitInsuranceEvent(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Insurance event logged successfully!';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message || 'Failed to record event.';
      }
    });
  }
}
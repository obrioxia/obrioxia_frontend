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
  metadata = '';

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private logsService: LogsService) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const event = {
      event_type: this.eventType,
      actor_id: this.actorId,
      metadata: this.metadata ? JSON.parse(this.metadata) : {}
    };

    this.logsService.submitInsuranceEvent(event).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Event logged successfully.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to record event.';
      }
    });
  }
}
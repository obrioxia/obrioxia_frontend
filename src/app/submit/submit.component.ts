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

  eventType = '';
  actorId = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit() {
    if (!this.eventType.trim() || !this.actorId.trim()) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.logsService.submitInsuranceEvent({
      eventType: this.eventType,
      actorId: this.actorId
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.ok) {
          this.successMessage = `Stored Successfully! ID: ${res.id}`;
          this.eventType = '';
          this.actorId = '';
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
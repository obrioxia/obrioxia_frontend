import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogsService, LogEntry } from '../services/logs.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  logsService = inject(LogsService);

  logs: LogEntry[] = [];
  isLoading = true;
  error = '';

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading = true;
    this.logsService.getLogs(100).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.ok && res.items) {
          this.logs = res.items;
        } else {
          this.error = res.error || 'Failed to fetch hash chain';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.message;
      }
    });
  }
}
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

  logs: any[] = []; // Changed to any[] to handle varying backend field names
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
        console.log("Audit Chain Data:", res); // Debugging

        // FIX: Handle the raw Array directly
        if (Array.isArray(res)) {
          this.logs = res;
        } 
        // Fallback: Handle the object wrapper if backend changes later
        else if (res && res.ok && res.items) {
          this.logs = res.items;
        } 
        else {
          this.error = 'Invalid data format received from server';
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.error = 'Connection Error: ' + (err.message || 'Server unreachable');
      }
    });
  }
}

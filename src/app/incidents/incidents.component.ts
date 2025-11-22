import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogsService, Incident } from '../services/logs.service';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.css']
})
export class IncidentsComponent implements OnInit {
  private logsService = inject(LogsService);
  
  incidents: Incident[] = [];
  isLoading = true;
  error = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.error = '';
    
    this.logsService.getIncidents().subscribe({
      next: (data) => {
        this.isLoading = false;
        // Handle raw array response vs wrapped response
        if (Array.isArray(data)) {
          this.incidents = data;
        } else {
          this.incidents = (data as any).items || [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Failed to connect to server.';
        console.error(err);
      }
    });
  }

  // NEW: Generates and downloads the JSON file
  downloadJson() {
    if (this.incidents.length === 0) return;

    const dataStr = JSON.stringify(this.incidents, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `obrioxia_export_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}



import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

// Imports for standalone component
import { CommonModule } from '@angular/common';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- THIS IS THE FIX

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    JsonPipe, 
    FormsModule // <-- THIS IS THE FIX
  ], 
  templateUrl: './app.component.html'
})
export class AppComponent {
  private http = inject(HttpClient);

  // Use signals for reactive state
  serverResponse = signal<any>(null);
  logs = signal<any[]>([]);
  verifyStatus = signal<any>(null);

  // This is the demo data we will send
  incidentData: any = {
    actor: { type: 'human', id: 'operator-1' },
    system: { name: 'obrioxia-demo', env: 'dev' },
    decision: { type: 'moderation', outcome: 'allow', score: 0.82 },
    raw_input: { text: 'hello world' },
    model: { provider: 'openai', name: 'gpt-4o', version: '2025-10-01' },
    meta: { ticket: 'T-123' }
  };

  // --- Button Click Handlers ---
  // No HttpHeaders needed! The proxy handles it.

  onSubmit(){
    this.http.post(`${environment.apiUrl}/log`, this.incidentData)
      .subscribe({
        next: (r:any) => this.serverResponse.set(r),
        error: (e) => this.serverResponse.set(e.error || { error: "Request failed" })
      });
  }

  loadLogs(){
    this.http.get(`${environment.apiUrl}/logs`)
      .subscribe({
        next: (r:any) => this.logs.set(r.items || []),
        error: (e) => this.logs.set([])
      });
  }

  verifyChain(){
    this.http.post(`${environment.apiUrl}/verify`, {})
      .subscribe({
        next: (r:any) => this.verifyStatus.set(r),
        error: (e) => this.verifyStatus.set(e.error || { error: "Verify failed" })
      });
  }

  exportPAC(){
    this.http.post(`${environment.apiUrl}/export/pac`, { case_id: 'DEMO-CASE-123' })
      .subscribe({
        next: (r:any) => this.serverResponse.set(r),
        error: (e) => this.serverResponse.set(e.error || { error: "Export failed" })
      });
  }
}


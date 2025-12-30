import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // ✅ Dynamically uses Render/Local URL

export interface InsuranceLogData {
  policyNumber: string;
  incidentType: string;
  claimAmount: number;
  decisionNotes: string;
  aiConfidenceScore: number;
  agentId: string;
}

export interface LogEntry {
  timestamp: string;
  eventType: string;
  hash: string;
  status: string;
  policyNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private http = inject(HttpClient);

  // ✅ Ensures no trailing slash for clean endpoint concatenation
  private apiUrl = environment.apiUrl.replace(/\/$/, '');
  private readonly HARD_CODED_KEY = 'c919848182e3e4250082ea7bacd14e170';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.HARD_CODED_KEY 
    });
  }

  // --- 1. SUBMIT EVENT ---
  /**
   * Hits: https://your-backend.onrender.com/api/incidents
   */
  submitInsuranceEvent(data: InsuranceLogData): Observable<any> {
    const payload = {
      policyNumber: data.policyNumber,
      incidentType: data.incidentType,
      claimAmount: data.claimAmount,
      decisionNotes: data.decisionNotes,
      aiConfidenceScore: data.aiConfidenceScore,
      agentId: data.agentId
    };

    return this.http.post<any>(
      `${this.apiUrl}/api/incidents`, 
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      map(res => ({
        success: true,
        id: res.receipt.sequence, 
        sequence: res.receipt.sequence,
        current_hash: res.receipt.current_hash,
        prev_hash: res.receipt.prev_hash,
        timestamp: res.receipt.timestamp
      })),
      catchError(err => {
        console.error('Submission Error:', err);
        return throwError(() => err);
      })
    );
  }

  // --- 2. GET LOGS (Audit Ledger Data) ---
  /**
   * Hits: https://your-backend.onrender.com/api/admin/incidents
   */
  getLogs(): Observable<LogEntry[]> {
    return this.http.get<any>(
      `${this.apiUrl}/api/admin/incidents?page_size=100`, 
      { headers: this.getHeaders() }
    ).pipe(
      map((res: any) => {
        const rawData = res.data || []; 
        return rawData.map((item: any) => ({
          timestamp: item.timestamp,
          // ✅ Backend uses snake_case, mapping to camelCase for UI
          eventType: item.incident_type || 'Generic Event', 
          hash: item.current_hash,
          status: 'Verified',
          policyNumber: item.policy_number
        }));
      }),
      // Fallback prevents a blank UI if the backend is waking up from sleep
      catchError(err => {
        console.warn('Backend fetch failed, using demo fallback:', err);
        return of([
          { timestamp: new Date().toISOString(), eventType: 'Genesis Block', hash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', status: 'Verified', policyNumber: 'OBX-GENESIS' }
        ]);
      })
    );
  }

  // --- 3. VERIFY POLICY ---
  verifyPolicy(hash: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/api/verify`,
      { current_hash: hash }, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // --- 4. SHRED USER (GDPR / Data Retention) ---
  shredUser(policyNumber: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/api/admin/shred/${policyNumber}`,
      { headers: this.getHeaders() }
    );
  }
}

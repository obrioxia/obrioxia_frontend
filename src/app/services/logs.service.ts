import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// Define the shape of data the frontend sends
export interface InsuranceLogData {
  policyNumber: string;
  incidentType: string;
  claimAmount: number;
  decisionNotes: string;
  aiConfidenceScore: number;
  agentId: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private http = inject(HttpClient);
  
  // Remove trailing slash to prevent double-slashes in URLs
  private apiUrl = environment.apiUrl.replace(/\/$/, '');

  private getHeaders(): HttpHeaders {
    // 1. We grab the API Key from environment
    const apiKey = environment.apiKey || ''; 

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': apiKey 
    });
  }

  // --- 1. SUBMIT INCIDENT (Write to Chain) ---
  submitInsuranceEvent(data: InsuranceLogData): Observable<any> {
    
    // 2. Map Frontend (camelCase) to Backend (snake_case)
    const payload = {
      policy_number: data.policyNumber,
      incident_type: data.incidentType,
      claim_amount: data.claimAmount,
      decision_notes: data.decisionNotes,
      ai_confidence_score: data.aiConfidenceScore,
      agent_id: data.agentId
    };

    return this.http.post<any>(
      `${this.apiUrl}/api/incidents`, 
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      map(res => ({
        success: true,
        id: res.id,
        sequence: res.sequence,
        current_hash: res.current_hash,
        prev_hash: res.prev_hash
      })),
      catchError(err => {
        console.error('Submission Error:', err);
        return throwError(() => err);
      })
    );
  }

  // --- 2. GET FULL CHAIN (For Dashboard/Visualization) ---
  getChain(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/chain`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // --- 3. VERIFY INTEGRITY (For Public Verify Page) ---
  verifyPolicy(policyNumber: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/api/verify`,
      { policy_number: policyNumber },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }
}

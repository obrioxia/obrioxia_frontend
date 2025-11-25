import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
  // Remove trailing slash to be safe
  private apiUrl = environment.apiUrl.replace(/\/$/, '');
  
  // HARDCODED KEY FOR DEMO STABILITY
  private readonly HARD_CODED_KEY = 'c919848182e3e4250082ea7bacd14e170';

  private getHeaders(): HttpHeaders {
    console.log('Attaching API Key:', this.HARD_CODED_KEY); // Debug log

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.HARD_CODED_KEY 
    });
  }

  // SUBMIT INCIDENT
  submitInsuranceEvent(data: InsuranceLogData): Observable<any> {
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

  // GET CHAIN
  getChain(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/chain`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // VERIFY POLICY
  verifyPolicy(policyNumber: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/api/verify`,
      { policyNumber: policyNumber },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }
}

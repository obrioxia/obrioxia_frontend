import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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

  // Hardcoded as per your previous setup
  private apiUrl = 'https://obrioxia-backend-pkrp.onrender.com';
  private readonly HARD_CODED_KEY = 'c919848182e3e4250082ea7bacd14e170';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.HARD_CODED_KEY 
    });
  }

  // SUBMIT INCIDENT
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

  // GET CHAIN
  getChain(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/admin/incidents?page_size=100`, 
      { headers: this.getHeaders() }
    ).pipe(
      map((res: any) => res.data),
      catchError(err => throwError(() => err))
    );
  }

  // VERIFY POLICY
  verifyPolicy(hash: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/api/verify`,
      { current_hash: hash }, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // SHRED USER (New Admin Feature)
  shredUser(policyNumber: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/api/admin/shred/${policyNumber}`,
      { headers: this.getHeaders() }
    );
  }
}



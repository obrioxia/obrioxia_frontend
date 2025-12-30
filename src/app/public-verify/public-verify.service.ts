import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // ✅ Verified path

export interface VerifyResponse {
  ok: boolean;
  valid: boolean;
  checked: number;
  error?: string;
}

export interface LogEntry {
  sequence: number;
  timestamp: string;
  chain_hash: string;
  prev_chain_hash: string;
  event_type: string;
  actor_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicVerifyService {
  private http = inject(HttpClient);
  
  // ✅ Ensures no trailing slash for cleaner concatenation
  private apiUrl = environment.apiUrl.replace(/\/$/, '');

  /**
   * Sends logs to the backend to verify cryptographic integrity.
   * Logic: Hits your Python Render backend /verify endpoint.
   */
  verifyLogs(logs: any[]): Observable<VerifyResponse> {
    return this.http.post<VerifyResponse>(`${this.apiUrl}/verify`, { logs }).pipe(
      catchError(err => {
        console.error('Verification API error:', err);
        return of({ ok: false, valid: false, checked: 0, error: 'Server connection failed.' });
      })
    );
  }

  /**
   * Fetches the current state of the blockchain.
   * FIX: Backend uses /chain instead of /logs.
   */
  getChainPreview(limit: number = 100): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/chain?limit=${limit}`).pipe(
      catchError((err) => {
        console.error('Chain Preview Error:', err);
        return of({ ok: false, items: [] });
      })
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
  private apiUrl = environment.apiUrl.replace(/\/$/, '');

  // Correct backend endpoint
  verifyLogs(logs: any[]): Observable<VerifyResponse> {
    return this.http.post<VerifyResponse>(`${this.apiUrl}/verify`, { logs }).pipe(
      catchError(err => {
        console.error('Verification API error:', err);
        return of({ ok: false, valid: false, checked: 0, error: 'Server connection failed.' });
      })
    );
  }

  // FIX: Backend no longer has /logs — use /chain
  getChainPreview(limit: number = 100): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/chain?limit=${limit}`).pipe(
      catchError(() => of({ ok: false, items: [] }))
    );
  }
}
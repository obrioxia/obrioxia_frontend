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
  ts_iso: string;
  entry_hash: string;
  prev_hash: string;
  decision?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PublicVerifyService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  verifyLogs(logs: any[]): Observable<VerifyResponse> {
    return this.http.post<VerifyResponse>(`${this.apiUrl}/verify`, { logs }).pipe(
      catchError(err => {
        console.error('Verification API error:', err);
        return of({ ok: false, valid: false, checked: 0, error: 'Server connection failed.' });
      })
    );
  }

  getChainPreview(limit: number = 100): Observable<{ ok: boolean, items: LogEntry[] }> {
    return this.http.get<{ ok: boolean, items: LogEntry[] }>(`${this.apiUrl}/logs?limit=${limit}`).pipe(
      catchError(() => of({ ok: false, items: [] }))
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// INTERFACES MATCHING FASTAPI BACKEND
export interface Incident {
  id?: string;
  _id?: string;       
  vehicleId?: string; 
  timestamp?: string;
  ts_iso?: string;    
  hash?: string;
  prev_hash?: string;
}

export interface LogEntry {
  _id: string;
  ts_iso: string;
  actor: any;
  system: any;
  decision: any;
  input_hash: string;
  model: any;
  prev_hash: string;
  entry_hash: string;
  meta: any;
}

// RESPONSE INTERFACE FROM FASTAPI
export interface FastAPIResponse {
  success: boolean;
  obrioxia_decision_id: string;
  sequence: number;
  chain_hash: string;
  prev_chain_hash: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Obrioxia-Key': 'obrioxia-dev-key'
    });
  }

  // POST /api/incidents
  // FIX: Map the FastAPI response to a generic format the component understands
  submitIncident(vehicleId: string): Observable<any> {
    return this.http.post<FastAPIResponse>(
      `${this.apiUrl}/incidents`,
      { vehicleId },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        // Transform backend response to what component expects
        if (response.success) {
          return { ok: true, id: response.obrioxia_decision_id };
        }
        return { ok: false, error: 'Unknown error' };
      }),
      catchError(this.handleError)
    );
  }

  // GET /api/incidents
  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(
      `${this.apiUrl}/incidents`, 
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  // GET /api/logs
  getLogs(limit: number = 100): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/logs?limit=${limit}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }
}



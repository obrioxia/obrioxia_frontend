import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.replace(/\/$/, '');

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // LOG INSURANCE EVENT (mapped to backend /api/incidents)
  submitInsuranceEvent(event: { eventType: string; actorId: string }): Observable<any> {
    const payload = {
      vehicleID: null,
      speed: null,
      gForce: null,
      data: {
        eventType: event.eventType,
        actorId: event.actorId
      }
    };

    return this.http.post<any>(
      `${this.apiUrl}/api/incidents`,   // <— FIXED
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      map(res => ({
        ok: res.success || false,
        id: res.obrioxia_decision_id || null,
        sequence: res.sequence || null
      })),
      catchError(err => throwError(() => err))
    );
  }
}
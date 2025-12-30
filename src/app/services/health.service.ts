import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, of, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  // ✅ Ensures no trailing slash for consistent endpoint joining
  private apiUrl = environment.apiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  /**
   * Pings the Render backend to check system readiness.
   * Expects: { "status": "operational" } from the Python server.
   */
  checkBackendStatus(): Observable<boolean> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/health`).pipe(
      map(res => res.status === 'operational'),
      catchError((err) => {
        console.error('Health Check Failed:', err);
        return of(false);
      })
    );
  }
}

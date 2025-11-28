import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, of, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  constructor(private http: HttpClient) {}

  // Renamed to match legacy component expectations
  checkBackendStatus(): Observable<boolean> {
    return this.http.get<{ status: string }>(`${environment.apiUrl}/health`).pipe(
      map(res => res.status === 'operational'),
      catchError(() => of(false))
    );
  }
}

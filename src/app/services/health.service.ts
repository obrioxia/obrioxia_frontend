import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HealthService {

  // Uses the URL from your environment file
  private healthUrl = `${environment.apiUrl}/health`;

  constructor(private http: HttpClient) { }

  /**
   * Checks if the backend is reachable.
   * Returns true if status is 200 OK, false otherwise.
   * Timeouts after 5 seconds to avoid hanging the UI.
   */
  checkBackendStatus(): Observable<boolean> {
    return this.http.get(this.healthUrl).pipe(
      timeout(5000), // Fail if no response in 5s
      map(() => true), // If success, return true
      catchError(() => of(false)) // If error/timeout, return false
    );
  }
}


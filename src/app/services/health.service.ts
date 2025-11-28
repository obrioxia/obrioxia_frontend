import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  constructor(private http: HttpClient) {}

  checkStatus(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/health`).pipe(
      catchError(() => of({ status: 'offline' }))
    );
  }
}

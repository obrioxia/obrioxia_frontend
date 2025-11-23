import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

  submitInsuranceEvent(event: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/log-event`,
      event,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getChain(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/chain`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  private handleError(err: any) {
    console.error('API Error:', err);
    return throwError(() => err);
  }
}
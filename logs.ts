import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  // ---------------------------------------------------------
  // UPDATE: Pointing to your live Render Backend
  // ---------------------------------------------------------
  private baseUrl = 'https://obrioxia-backend-pkrp.onrender.com';

  constructor(private http: HttpClient) {}

  // 1. GET LOGS (For the list view)
  getLogs(): Observable<any> {
    // Calls: https://obrioxia-backend-pkrp.onrender.com/api/logs
    return this.http.get<any>(`${this.baseUrl}/api/logs`);
  }

  // 2. VERIFY CHAIN (For the JSON Upload Box)
  verifyLogs(data: any): Observable<any> {
    // Calls: https://obrioxia-backend-pkrp.onrender.com/api/verify
    return this.http.post<any>(`${this.baseUrl}/api/verify`, data);
  }
}


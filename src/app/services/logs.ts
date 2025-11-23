import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LogsService {

  private INCIDENTS_URL = 'http://localhost:3000/api/incidents';
  private CHAINLOGS_URL = 'http://localhost:3000/api/logs';

  private headers = new HttpHeaders({
    'X-Obrioxia-Key': 'c919848182e3e4250082ea7bacd14e170',  
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getIncidents() {
    return this.http.get<any>(this.INCIDENTS_URL, { headers: this.headers });
  }

  getChainLogs() {
    return this.http.get<any>(this.CHAINLOGS_URL, { headers: this.headers });
  }
}
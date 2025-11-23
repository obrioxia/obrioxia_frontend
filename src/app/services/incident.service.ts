import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Incident {
  vehicleID?: string;
  speed?: number;
  gForce?: number;
  data?: any;
  sequence: number;
  chain_hash: string;
  prev_chain_hash?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/incidents`;

  getIncidents() {
    return this.http.get<any>(this.apiUrl);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private async getHeaders(requiresAuth: boolean = false) {
    let headers = new HttpHeaders();
    if (requiresAuth) {
      const token = await this.auth.getToken();
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      headers = headers.set('x-api-key', environment.apiKey);
    }
    return headers;
  }

  async submitIncident(data: any) {
    const headers = await this.getHeaders(false);
    return firstValueFrom(this.http.post(`${environment.apiUrl}/incidents`, data, { headers }));
  }

  async verifyReceipt(receipt: any) {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/verify`, receipt));
  }

  async getAdminIncidents(page: number, pageSize: number, filter: string) {
    const headers = await this.getHeaders(true);
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (filter) params = params.set('policy_filter', filter);
    return firstValueFrom(this.http.get<any>(`${environment.apiUrl}/admin/incidents`, { headers, params }));
  }

  async downloadSubmissionPdf(receipt: any) {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/pdf/submission`, receipt, { responseType: 'blob' }));
  }

  async downloadVerificationPdf(proof: any) {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/pdf/verification`, proof, { responseType: 'blob' }));
  }
}

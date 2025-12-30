import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth'; 
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // ✅ Ensures no trailing slash for clean path joining
  private apiUrl = environment.apiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient, private auth: Auth) {}

  /**
   * Generates authorization headers.
   * Prioritizes Demo Keys for access-gate logic, then Firebase tokens for Admin.
   */
  private async getHeaders(demoKey: string = '') {
    let headers = new HttpHeaders();
    if (demoKey) return headers.set('X-Demo-Key', demoKey);
    
    const user = await firstValueFrom(authState(this.auth).pipe(take(1)));
    const token = await user?.getIdToken();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      headers = headers.set('x-api-key', environment.apiKey);
    }
    return headers;
  }

  // --- 📧 ACCESS & HANDSHAKE METHODS ---

  /**
   * Hits: https://your-backend.onrender.com/api/demo/request-key
   */
  requestDemoKey(email: string) {
    return this.http.post(`${this.apiUrl}/api/demo/request-key`, { email });
  }

  /**
   * Hits: https://your-backend.onrender.com/api/demo/verify
   */
  verifyDemoKey(key: string) {
    return this.http.post(`${this.apiUrl}/api/demo/verify`, { key });
  }

  // --- 📊 INCIDENT & BATCH METHODS ---

  async submitIncident(data: any, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    return firstValueFrom(this.http.post(`${this.apiUrl}/api/incidents`, data, { headers }));
  }

  async uploadBatch(file: File, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post(`${this.apiUrl}/api/admin/upload-csv`, formData, { headers }));
  }

  // --- 🛡️ ADMIN & VERIFICATION ---

  async getAdminIncidents(page: number, pageSize: number, filter: string = '') {
    const headers = await this.getHeaders(); 
    let params = new HttpParams().set('page', page.toString()).set('page_size', pageSize.toString());
    if (filter) params = params.set('search', filter);
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/api/admin/incidents`, { headers, params }));
  }

  async verifyReceipt(receipt: any) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/api/verify`, receipt));
  }

  // ✅ New endpoint for the Public Verification tool
  verifyHash(hash: string) {
    return this.http.get(`${this.apiUrl}/api/verify/${hash}`);
  }

  async downloadSubmissionPdf(receipt: any) {
    const headers = await this.getHeaders(); 
    return firstValueFrom(this.http.post(`${this.apiUrl}/api/pdf/submission`, receipt, { 
      headers, 
      responseType: 'blob' 
    }));
  }
}

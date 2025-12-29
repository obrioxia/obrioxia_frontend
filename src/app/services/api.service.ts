import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth'; 
import { environment } from '../../environments/environment'; // ✅ Connects to your prod config

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // ✅ FIXED: Dynamically pulls from environment.prod.ts during build
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: Auth) {}

  private async getHeaders(demoKey: string = '') {
    let headers = new HttpHeaders();
    if (demoKey) return headers.set('X-Demo-Key', demoKey);
    
    const user = await firstValueFrom(authState(this.auth).pipe(take(1)));
    const token = await user?.getIdToken();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      // ✅ Uses the key synchronized in your environment file
      headers = headers.set('x-api-key', environment.apiKey);
    }
    return headers;
  }

  // --- 📧 ACCESS & HANDSHAKE METHODS ---

  requestDemoKey(email: string) {
    return this.http.post(`${this.apiUrl}/demo/request-key`, { email });
  }

  verifyDemoKey(key: string) {
    return this.http.post(`${this.apiUrl}/demo/verify`, { key });
  }

  // --- 📊 INCIDENT & BATCH METHODS ---

  async submitIncident(data: any, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    return firstValueFrom(this.http.post(`${this.apiUrl}/incidents`, data, { headers }));
  }

  async uploadBatch(file: File, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post(`${this.apiUrl}/admin/upload-csv`, formData, { headers }));
  }

  // --- 🛡️ ADMIN & VERIFICATION ---

  async getAdminIncidents(page: number, pageSize: number, filter: string = '') {
    const headers = await this.getHeaders(); 
    let params = new HttpParams().set('page', page.toString()).set('page_size', pageSize.toString());
    if (filter) params = params.set('search', filter);
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/admin/incidents`, { headers, params }));
  }

  async verifyReceipt(receipt: any) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/verify`, receipt));
  }

  async downloadSubmissionPdf(receipt: any) {
    const headers = await this.getHeaders(); 
    return firstValueFrom(this.http.post(`${this.apiUrl}/pdf/submission`, receipt, { 
      headers, 
      responseType: 'blob' 
    }));
  }
}

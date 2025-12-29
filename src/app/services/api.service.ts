import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth'; 

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private apiUrl = 'https://obrioxia-engine.onrender.com/api';

  constructor(private http: HttpClient, private auth: Auth) {}

  private async getHeaders(demoKey: string = '') {
    let headers = new HttpHeaders();
    if (demoKey) {
      return headers.set('X-Demo-Key', demoKey);
    }
    const user = await firstValueFrom(authState(this.auth).pipe(take(1)));
    const token = await user?.getIdToken();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      headers = headers.set('x-api-key', 'c919848182e3e4250082ea7bacd14e170');
    }
    return headers;
  }

  // --- CORE SYSTEM METHODS ---
  requestDemoKey(email: string) {
    return this.http.post(`${this.apiUrl}/demo/request-key`, { email });
  }

  verifyDemoKey(key: string) {
    return this.http.post(`${this.apiUrl}/demo/verify`, { key });
  }

  async submitIncident(data: any, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    return firstValueFrom(this.http.post(`${this.apiUrl}/incidents`, data, { headers }));
  }

  // ✅ RESTORED: This fixes the TS2339 'uploadBatch' error
  async uploadBatch(file: File, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post(`${this.apiUrl}/admin/upload-csv`, formData, { headers }));
  }

  // ✅ RESTORED: This fixes the previous TS2339 'getAdminIncidents' error
  async getAdminIncidents(page: number, pageSize: number, filter: string = '') {
    const headers = await this.getHeaders(); 
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    
    if (filter) {
      params = params.set('search', filter);
    }
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/admin/incidents`, { headers, params }));
  }

  // --- CERTIFICATE & VERIFICATION ---
  async downloadSubmissionPdf(receipt: any) {
    const headers = await this.getHeaders(); 
    return firstValueFrom(this.http.post(`${this.apiUrl}/pdf/submission`, receipt, { 
      headers, 
      responseType: 'blob' 
    }));
  }

  async verifyReceipt(receipt: any) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/verify`, receipt));
  }
}

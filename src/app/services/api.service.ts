import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth'; 
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private apiUrl = environment.apiUrl.replace(/\/$/, '').replace(/\/api$/, '');

  constructor(private http: HttpClient, private auth: Auth) {}

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

  requestDemoKey(email: string) {
    return this.http.post(`${this.apiUrl}/api/demo/request-key`, { email });
  }

  verifyDemoKey(key: string) {
    return this.http.post(`${this.apiUrl}/api/demo/verify/`, { key });
  }

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

  async getAdminIncidents(page: number, pageSize: number, filter: string = '') {
    const headers = await this.getHeaders(); 
    let params = new HttpParams().set('page', page.toString()).set('page_size', pageSize.toString());
    if (filter) params = params.set('search', filter);
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/api/admin/incidents`, { headers, params }));
  }

  async verifyReceipt(receipt: any) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/api/verify/`, receipt));
  }

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

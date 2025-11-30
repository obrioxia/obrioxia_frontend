import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth'; 

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private apiUrl = 'https://obrioxia-backend-pkrp.onrender.com/api';

  constructor(private http: HttpClient, private auth: Auth) {}

  // FIXED: Uses authState pipe to GUARANTEE we wait for the SDK to load
  private async getHeaders() {
    const user = await firstValueFrom(authState(this.auth).pipe(take(1)));
    const token = await user?.getIdToken();
    
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      headers = headers.set('x-api-key', 'public-demo-key-2025');
    }
    return headers;
  }

  // --- METHODS ---

  async submitIncident(data: any) {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.post(`${this.apiUrl}/incidents`, data, { headers }));
  }

  async uploadBatch(file: File) {
    const headers = await this.getHeaders();
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post(`${this.apiUrl}/admin/upload-csv`, formData, { headers }));
  }

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

  async getAdminIncidents(page: number, pageSize: number, filter: string) {
    const headers = await this.getHeaders();
    let params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize);
    
    if (filter) {
      params = params.set('search', filter);
    }

    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/admin/incidents`, { headers, params }));
  }
}

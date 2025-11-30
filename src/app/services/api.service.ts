import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auth } from '@angular/fire/auth'; 

// We use direct Auth injection to be safe, or your existing AuthService if preferred.
// To guarantee this works without seeing your AuthService, I will use AngularFire Auth directly 
// but keep the Promise-based signature you are used to.

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // Hardcoded to ensure connection to your Live Backend
  private apiUrl = 'https://obrioxia-backend-pkrp.onrender.com/api';

  constructor(private http: HttpClient, private auth: Auth) {}

  // Helper to get token
  private async getHeaders() {
    const token = await this.auth.currentUser?.getIdToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      headers = headers.set('x-api-key', 'public-demo-key-2025');
    }
    return headers;
  }

  // --- ORIGINAL METHODS (Restored for SubmitComponent) ---

  async submitIncident(data: any) {
    const headers = await this.getHeaders();
    // Maps to the new backend endpoint
    return firstValueFrom(this.http.post(`${this.apiUrl}/incidents`, data, { headers }));
  }

  async uploadBatch(file: File) {
    const headers = await this.getHeaders();
    const formData = new FormData();
    formData.append('file', file);
    // Maps to the new backend CSV endpoint
    return firstValueFrom(this.http.post(`${this.apiUrl}/admin/upload-csv`, formData, { headers }));
  }

  async downloadSubmissionPdf(receipt: any) {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.post(`${this.apiUrl}/pdf/submission`, receipt, { 
      headers, 
      responseType: 'blob' 
    }));
  }

  // --- NEW METHODS (For Admin & Verify) ---

  async verifyReceipt(receipt: any) {
    // Public endpoint, no auth needed usually, but headers won't hurt
    return firstValueFrom(this.http.post(`${this.apiUrl}/verify`, receipt));
  }

  // Signature matches what your Admin Dashboard expects
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

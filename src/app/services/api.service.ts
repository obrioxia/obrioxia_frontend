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

  // --- HELPER: Get Headers (Mixed Auth) ---
  private async getHeaders(demoKey: string = '') {
    // 1. If a Demo Key is provided, use it specifically
    if (demoKey) {
      return new HttpHeaders().set('X-Demo-Key', demoKey);
    }

    // 2. Otherwise, try Firebase Auth (Pro Users)
    const user = await firstValueFrom(authState(this.auth).pipe(take(1)));
    const token = await user?.getIdToken();
    
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      // Fallback for public non-demo access (if any)
      headers = headers.set('x-api-key', 'public-demo-key-2025');
    }
    return headers;
  }

  // --- METHODS ---

  // 1. CHECK BALANCE (New)
  verifyDemoKey(key: string) {
    return this.http.post(`${this.apiUrl}/demo/verify`, { key });
  }

  // 2. SUBMIT INCIDENT (Updated for Demo Key)
  async submitIncident(data: any, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    return firstValueFrom(this.http.post(`${this.apiUrl}/incidents`, data, { headers }));
  }

  // 3. UPLOAD BATCH (Updated for Demo Key)
  async uploadBatch(file: File, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    const formData = new FormData();
    formData.append('file', file);
    // Note: Ensure your backend has /api/upload/batch or /api/admin/upload-csv mapped correctly
    return firstValueFrom(this.http.post(`${this.apiUrl}/upload/batch`, formData, { headers }));
  }

  // 4. DOWNLOAD PDF
  async downloadSubmissionPdf(receipt: any) {
    // PDF download doesn't strictly need the demo key for generation, but good practice
    const headers = await this.getHeaders(); 
    return firstValueFrom(this.http.post(`${this.apiUrl}/pdf/submission`, receipt, { 
      headers, 
      responseType: 'blob' 
    }));
  }

  // 5. VERIFY RECEIPT (Public)
  async verifyReceipt(receipt: any) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/verify`, receipt));
  }
}

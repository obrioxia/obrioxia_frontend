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

  // --- HELPER: Get Headers (Handles Demo Keys + Pro Auth) ---
  private async getHeaders(demoKey: string = '') {
    // 1. If a Demo Key is passed explicitly (from Submit page), use it.
    if (demoKey) {
      return new HttpHeaders().set('X-Demo-Key', demoKey);
    }

    // 2. Otherwise, check for a Firebase Pro User (for Dashboard/Admin)
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

  // --- DEMO / SUBMIT METHODS ---

  // 1. CHECK BALANCE (For the Credit Counter)
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
    // Note: Ensure backend has /api/upload/batch or similar mapped
    return firstValueFrom(this.http.post(`${this.apiUrl}/admin/upload-csv`, formData, { headers }));
  }

  // 4. DOWNLOAD PDF
  async downloadSubmissionPdf(receipt: any) {
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

  // --- ADMIN / DASHBOARD METHODS (Restored) ---

  // 6. GET ADMIN INCIDENTS (This was missing!)
  async getAdminIncidents(page: number, pageSize: number, filter: string) {
    const headers = await this.getHeaders(); // Uses Firebase Auth
    let params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize);
    
    if (filter) {
      params = params.set('search', filter);
    }

    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/admin/incidents`, { headers, params }));
  }
}

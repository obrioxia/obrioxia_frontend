import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth'; 

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // ✅ UPDATED: Points to the new Python v4.0 Engine
  private apiUrl = 'https://obrioxia-engine.onrender.com/api';

  constructor(private http: HttpClient, private auth: Auth) {}

  /**
   * HELPER: Get Headers
   * Synchronizes the authorization handshake between the demo and the Python backend.
   */
  private async getHeaders(demoKey: string = '') {
    let headers = new HttpHeaders();

    // 1. If a Demo Key is present, use the X-Demo-Key header
    if (demoKey) {
      return headers.set('X-Demo-Key', demoKey);
    }

    // 2. Otherwise, check for Firebase Token (for Pro/Admin users)
    const user = await firstValueFrom(authState(this.auth).pipe(take(1)));
    const token = await user?.getIdToken();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      // 3. Fallback public API key to prevent unauthorized 401s
      headers = headers.set('x-api-key', 'c919848182e3e4250082ea7bacd14e170');
    }
    return headers;
  }

  // --- DEMO / SUBMIT METHODS ---

  // 1. CHECK BALANCE: Verifies remaining credits for the demo user
  verifyDemoKey(key: string) {
    return this.http.post(`${this.apiUrl}/demo/verify`, { key });
  }

  // 2. SUBMIT INCIDENT: Logs the event to the SHA-256 chain
  async submitIncident(data: any, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    return firstValueFrom(this.http.post(`${this.apiUrl}/incidents`, data, { headers }));
  }

  // 3. UPLOAD BATCH: Sends CSV for bulk ledger ingestion
  async uploadBatch(file: File, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post(`${this.apiUrl}/admin/upload-csv`, formData, { headers }));
  }

  // 4. DOWNLOAD PDF: Generates the immutable certificate
  async downloadSubmissionPdf(receipt: any) {
    const headers = await this.getHeaders(); 
    return firstValueFrom(this.http.post(`${this.apiUrl}/pdf/submission`, receipt, { 
      headers, 
      responseType: 'blob' 
    }));
  }

  // 5. VERIFY RECEIPT: Uses Triple-Check (Hash/DecisionID/EntryKey)
  async verifyReceipt(receipt: any) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/verify`, receipt));
  }

  // --- ADMIN / DASHBOARD METHODS ---

  // 6. GET ADMIN INCIDENTS: Fetches the central audit log
  async getAdminIncidents(page: number, pageSize: number, filter: string) {
    const headers = await this.getHeaders(); 
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    
    if (filter) {
      params = params.set('search', filter);
    }

    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/admin/incidents`, { headers, params }));
  }
}

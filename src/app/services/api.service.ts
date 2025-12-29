import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth'; 

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // ✅ PRODUCTION URL: Matches your live Render instance
  private apiUrl = 'https://obrioxia-engine.onrender.com/api';

  constructor(private http: HttpClient, private auth: Auth) {}

  /**
   * HELPER: Get Secure Headers
   * Synchronizes auth between Demo Keys, Firebase Tokens, and Admin API Keys.
   */
  private async getHeaders(demoKey: string = '') {
    let headers = new HttpHeaders();

    // 1. Demo Key Logic
    if (demoKey) {
      return headers.set('X-Demo-Key', demoKey);
    }

    // 2. Firebase Auth Handshake
    const user = await firstValueFrom(authState(this.auth).pipe(take(1)));
    const token = await user?.getIdToken();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      // 3. Static Handshake Bypass
      headers = headers.set('x-api-key', 'c919848182e3e4250082ea7bacd14e170');
    }
    return headers;
  }

  // ==========================================
  // 📧 DEMO & EMAIL METHODS
  // ==========================================

  // 1. REQUEST DEMO KEY: Triggers the Resend Email Worker
  requestDemoKey(email: string) {
    return this.http.post(`${this.apiUrl}/demo/request-key`, { email });
  }

  // 2. VERIFY KEY: Checks remaining credits for the session
  verifyDemoKey(key: string) {
    return this.http.post(`${this.apiUrl}/demo/verify`, { key });
  }

  // ==========================================
  // 🛡️ LEDGER & INCIDENT METHODS
  // ==========================================

  // 3. SUBMIT INCIDENT: Logs event to the SHA-256 chain
  async submitIncident(data: any, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    return firstValueFrom(this.http.post(`${this.apiUrl}/incidents`, data, { headers }));
  }

  // 4. BATCH INGESTION: Bulk CSV upload for ledger auditing
  async uploadBatch(file: File, demoKey: string = '') {
    const headers = await this.getHeaders(demoKey);
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post(`${this.apiUrl}/admin/upload-csv`, formData, { headers }));
  }

  // ==========================================
  // 🔍 VERIFICATION & CERTIFICATES
  // ==========================================

  // 5. DOWNLOAD PDF: Generates the immutable audit certificate
  async downloadSubmissionPdf(receipt: any) {
    const headers = await this.getHeaders(); 
    return firstValueFrom(this.http.post(`${this.apiUrl}/pdf/submission`, receipt, { 
      headers, 
      responseType: 'blob' 
    }));
  }

  // 6. TRIPLE-CHECK VERIFY: Validates receipt integrity
  async verifyReceipt(receipt: any) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/verify`, receipt));
  }
}

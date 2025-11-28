import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  // Helper: Get headers with Public Key OR Firebase Token
  private async getHeaders(requiresAuth: boolean = false) {
    let headers = new HttpHeaders();
    
    if (requiresAuth) {
      // For Admin routes: Use Firebase Token
      const token = await this.auth.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    } else {
      // For Public routes: Use Demo Key
      headers = headers.set('x-api-key', environment.apiKey);
    }
    return headers;
  }

  // --- PUBLIC ENDPOINTS ---

  async submitIncident(data: any) {
    // Uses API Key
    const headers = await this.getHeaders(false);
    return firstValueFrom(this.http.post(`${environment.apiUrl}/incidents`, data, { headers }));
  }

  async verifyReceipt(receipt: any) {
    // Public, no special headers needed usually, but we stick to pattern
    return firstValueFrom(this.http.post(`${environment.apiUrl}/verify`, receipt));
  }

  // --- ADMIN / PROTECTED ENDPOINTS ---

  async uploadBatch(file: File) {
    // Batch upload can be switched to Firebase Auth now, or keep using Admin API Key.
    // Let's use Firebase Auth for the dashboard context.
    const headers = await this.getHeaders(true);
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post(`${environment.apiUrl}/batch-upload`, formData, { headers }));
  }

  async getAdminIncidents(page: number, pageSize: number, filter: string) {
    const headers = await this.getHeaders(true);
    let params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize);
    
    if (filter) {
      params = params.set('policy_filter', filter);
    }

    return firstValueFrom(this.http.get<any>(`${environment.apiUrl}/admin/incidents`, { headers, params }));
  }

  // --- PDF GENERATION ---
  
  async downloadSubmissionPdf(receipt: any) {
    // Public
    return firstValueFrom(this.http.post(`${environment.apiUrl}/pdf/submission`, receipt, { 
      responseType: 'blob' 
    }));
  }

  async downloadVerificationPdf(proof: any) {
    // Public
    return firstValueFrom(this.http.post(`${environment.apiUrl}/pdf/verification`, proof, { 
      responseType: 'blob' 
    }));
  }
}

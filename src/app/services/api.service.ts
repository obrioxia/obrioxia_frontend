import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // Render Backend URL
  private apiUrl = 'https://obrioxia-backend-pkrp.onrender.com/api';

  constructor(private http: HttpClient, private auth: Auth) {}

  // --- Public Headers ---
  private getPublicHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': 'public-demo-key-2025'
    });
  }

  // --- Authenticated Headers (Async) ---
  private async getAuthHeaders(): Promise<HttpHeaders> {
    const token = await this.auth.currentUser?.getIdToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // --- PUBLIC ENDPOINTS ---

  logIncident(incidentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/incidents`, incidentData, {
      headers: this.getPublicHeaders()
    });
  }

  downloadPDF(receipt: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/pdf/submission`, receipt, {
      headers: this.getPublicHeaders(),
      responseType: 'blob' 
    });
  }

  // --- ADMIN ENDPOINTS ---

  async getAdminIncidents(page: number = 1, search: string = ''): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    let url = `${this.apiUrl}/admin/incidents?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get(url, { headers });
  }

  async uploadBatchCSV(file: File): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    
    // Angular handles Content-Type boundary automatically for FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // Create headers specifically excluding Content-Type (to let browser set boundary)
    const uploadHeaders = new HttpHeaders({
        'Authorization': `Bearer ${await this.auth.currentUser?.getIdToken()}`
    });

    return this.http.post(`${this.apiUrl}/admin/upload-csv`, formData, { 
      headers: uploadHeaders 
    });
  }
}

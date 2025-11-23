import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PublicVerifyService, LogEntry } from './public-verify.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-public-verify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-verify.component.html',
  styleUrls: ['./public-verify.component.css']
})
export class PublicVerifyComponent {
  private service = inject(PublicVerifyService);
  private http = inject(HttpClient);

  isDragging = signal(false);
  isProcessing = signal(false);
  verificationResult = signal<{ valid: boolean; count: number; error?: string; isEmpty?: boolean } | null>(null);
  chainData = signal<LogEntry[]>([]);
  fileName = signal<string>('');

  // Use the same API URL structure as the service
  private readonly API_URL = environment?.apiUrl || 'https://obrioxia-backend-pkrp.onrender.com/api';

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File) {
    if (file.type !== 'application/json' && !file.name.toLowerCase().endsWith('.json')) {
      alert('Only .json files are supported.');
      return;
    }

    this.fileName.set(file.name);
    this.isProcessing.set(true);
    this.verificationResult.set(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text.trim()) throw new Error('File is empty');
        
        const jsonContent = JSON.parse(text);
        
        // Handle different JSON structures (Array vs Object with 'logs' key)
        let logsToSend: any[] = [];
        
        if (Array.isArray(jsonContent)) {
            logsToSend = jsonContent;
        } else if (jsonContent.logs && Array.isArray(jsonContent.logs)) {
            logsToSend = jsonContent.logs;
        } else {
             // Fallback: try to find any array in the object
             const values = Object.values(jsonContent);
             const foundArray = values.find(v => Array.isArray(v));
             if (foundArray) {
                 logsToSend = foundArray as any[];
             } else {
                 throw new Error("Could not find a list of logs in this JSON file.");
             }
        }

        // 2. SEND JSON TO BACKEND (/api/verify)
        this.verifyWithBackend(logsToSend);

      } catch (err: any) {
        console.error("Parse Error:", err);
        this.isProcessing.set(false);
        this.verificationResult.set({ 
            valid: false, 
            count: 0, 
            error: err.message || 'Invalid JSON file', 
            isEmpty: true 
        });
      }
    };
    reader.readAsText(file);
  }

  private verifyWithBackend(logs: any[]) {
    // Send to /api/verify matching the Backend "VerifyBody" model
    const payload = { logs: logs };

    // Remove the /api if it's already in the base URL to avoid /api/api/verify
    // But based on your Service, apiUrl usually includes /api. 
    // Let's use the full path construction safely.
    const url = `${this.API_URL.replace(/\/$/, '')}/verify`; 

    this.http.post<any>(url, payload).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        if (res.valid) {
          this.verificationResult.set({
            valid: true,
            count: res.checked || logs.length,
            error: undefined
          });
        } else {
          this.verificationResult.set({
            valid: false,
            count: res.checked || 0,
            error: res.error || 'Broken Chain Detected',
            isEmpty: false
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error("API Error:", err);
        this.isProcessing.set(false);
        this.verificationResult.set({
          valid: false,
          count: 0,
          error: err.error?.detail || err.message || 'Verification Server Error',
          isEmpty: false
        });
      }
    });
  }

  get resultClass() {
    const res = this.verificationResult();
    if (!res) return '';
    if (res.isEmpty) return 'empty-result';
    return res.valid ? 'valid-result' : 'invalid-result';
  }
}

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PublicVerifyService } from './public-verify.service';
import { environment } from 'src/environments/environment';

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
  fileName = signal('');

  verificationResult = signal<{
    valid: boolean;
    count: number;
    error?: string;
    isEmpty?: boolean;
  } | null>(null);

  chainData = signal<any[]>([]);

  private readonly API_URL = environment.apiUrl.replace(/\/$/, '');

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);

    const file = event.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File) {
    if (!file.name.endsWith('.json')) {
      alert('Only JSON files allowed.');
      return;
    }

    this.fileName.set(file.name);
    this.isProcessing.set(true);
    this.verificationResult.set(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = String(e.target?.result).trim();
        if (!text) throw new Error('Empty file.');

        const parsed = JSON.parse(text);

        let logs: any[] = [];

        if (Array.isArray(parsed)) logs = parsed;
        else if (parsed.logs) logs = parsed.logs;
        else {
          const maybeArray = Object.values(parsed).find(v => Array.isArray(v));
          if (!maybeArray) throw new Error('No logs array found.');
          logs = maybeArray as any[];
        }

        this.verifyWithBackend(logs);

      } catch (err: any) {
        console.error(err);
        this.isProcessing.set(false);
        this.verificationResult.set({
          valid: false,
          count: 0,
          error: err.message,
          isEmpty: true
        });
      }
    };

    reader.readAsText(file);
  }

  private verifyWithBackend(logs: any[]) {
    const url = `${this.API_URL}/verify`;

    this.http.post<any>(url, { logs }).subscribe({
      next: (res) => {
        this.isProcessing.set(false);

        if (res.valid) {
          this.verificationResult.set({
            valid: true,
            count: logs.length
          });
        } else {
          this.verificationResult.set({
            valid: false,
            count: 0,
            error: res.error
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.isProcessing.set(false);
        this.verificationResult.set({
          valid: false,
          count: 0,
          error: err.error?.detail || err.message
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
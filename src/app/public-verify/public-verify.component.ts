import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicVerifyService, LogEntry } from './public-verify.service';

@Component({
  selector: 'app-public-verify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-verify.component.html',
  styleUrls: ['./public-verify.component.css']
})
export class PublicVerifyComponent {
  private service = inject(PublicVerifyService);

  isDragging = signal(false);
  isProcessing = signal(false);
  verificationResult = signal<{ valid: boolean; count: number; error?: string; isEmpty?: boolean } | null>(null);
  chainData = signal<LogEntry[]>([]);
  fileName = signal<string>('');

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
        if (!text.trim()) {
             throw new Error('File is empty');
        }
        const json = JSON.parse(text);
        const logs = Array.isArray(json) ? json : (json.items || []);
        
        if (logs.length === 0) {
             this.isProcessing.set(false);
             this.verificationResult.set({ valid: false, count: 0, error: 'File contains no logs.', isEmpty: true });
             return;
        }

        this.runVerification(logs);
      } catch (err) {
        this.isProcessing.set(false);
        this.verificationResult.set({ valid: false, count: 0, error: 'Invalid or Empty JSON file', isEmpty: true });
      }
    };
    reader.readAsText(file);
  }

  private runVerification(logs: any[]) {
    this.service.verifyLogs(logs).subscribe(res => {
      setTimeout(() => {
        this.isProcessing.set(false);
        
        // Check if it was an "Empty" error from backend
        const isEmptyError = res.error?.includes('No logs provided');

        if (res.ok && res.valid) {
          this.verificationResult.set({
            valid: true,
            count: res.checked,
            error: undefined
          });
          this.loadChain();
        } else {
          this.verificationResult.set({
            valid: false,
            count: res.checked || 0,
            error: res.error || 'Verification failed',
            isEmpty: isEmptyError
          });
        }
      }, 600);
    });
  }

  private loadChain() {
    this.service.getChainPreview(100).subscribe(res => {
      if (res.ok) {
        this.chainData.set(res.items);
      }
    });
  }

  get resultClass() {
    const res = this.verificationResult();
    if (!res) return '';
    if (res.isEmpty) return 'empty-result'; // New CSS class
    return res.valid ? 'valid-result' : 'invalid-result';
  }
}



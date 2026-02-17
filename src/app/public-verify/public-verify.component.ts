import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HealthService } from '../services/health.service';
import { ApiService } from '../services/api.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-public-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-verify.component.html'
})
export class PublicVerifyComponent implements OnInit, OnDestroy {
  isLoading = signal(false);
  verificationResult = signal<any>(null);
  errorMessage = signal('');
  isDragging = false;
  isSystemOnline = false;
  private healthSub: Subscription | null = null;

  constructor(private healthService: HealthService, private api: ApiService) { }

  ngOnInit() {
    this.checkHealth();
    this.healthSub = interval(10000).subscribe(() => this.checkHealth());
  }

  ngOnDestroy() {
    if (this.healthSub) this.healthSub.unsubscribe();
  }

  checkHealth() {
    this.healthService.checkBackendStatus().subscribe(status => {
      this.isSystemOnline = status;
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.processFile(files[0]);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.processFile(file);
  }

  processFile(file: File) {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      this.errorMessage.set("Please upload the .json receipt, not the PDF.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data) throw new Error();
        await this.verifyReceiptFile(data);
      } catch {
        this.errorMessage.set("Invalid Receipt File.");
      }
    };
    reader.readAsText(file);
  }

  async verifyChain(key: string) {
    this.isLoading.set(true);
    this.verificationResult.set(null);
    try {
      // Calls the new FULL CHAIN verification endpoint
      const res = await this.api.verifyChainIntegrity();
      this.verificationResult.set(res);
    } catch {
      this.errorMessage.set("Verification Failed. System offline or key invalid.");
    } finally {
      this.isLoading.set(false);
    }
  }

  // Legacy file upload handler (single receipt check)
  async verifyReceiptFile(receipt: any) {
    this.isLoading.set(true);
    this.verificationResult.set(null);
    try {
      const payload = typeof receipt === 'string' ? { current_hash: receipt } : receipt;
      const res = await this.api.verifyReceipt(payload);
      this.verificationResult.set(res);
    } catch {
      this.errorMessage.set("Receipt Verification Failed.");
    } finally {
      this.isLoading.set(false);
    }
  }

  downloadProof() {
    const blob = new Blob([JSON.stringify(this.verificationResult(), null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification_proof.json`;
    a.click();
  }

  reset() {
    this.verificationResult.set(null);
    this.errorMessage.set('');
  }
}

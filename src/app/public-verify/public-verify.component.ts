import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HealthService } from '../services/health.service';
import { ApiService } from '../services/api.service'; // Use the shared service
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-public-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-verify.component.html',
  styles: [`
    :host { display: block; }
  `]
})
export class PublicVerifyComponent implements OnInit, OnDestroy {
  
  isLoading = false;
  verificationResult: any = null; // Single object result
  errorMessage = '';
  isDragging = false;
  isSystemOnline = false;
  private healthSub: Subscription | null = null;

  constructor(
    private healthService: HealthService,
    private api: ApiService // Injected
  ) {}

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
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const jsonContent = JSON.parse(e.target.result);
        
        // Handle Array vs Object
        let payloadToSend: any = null;
        if (Array.isArray(jsonContent) && jsonContent.length > 0) {
           payloadToSend = jsonContent[0];
        } else {
           payloadToSend = jsonContent;
        }

        if(!payloadToSend || !payloadToSend.current_hash) {
            this.errorMessage = "Invalid JSON: Missing cryptographic hash.";
            return;
        }

        await this.verifyChain(payloadToSend);

      } catch (err) {
        this.errorMessage = "Invalid JSON file.";
      }
    };
    reader.readAsText(file);
  }

  async verifyChain(data: any) {
    this.isLoading = true;
    this.errorMessage = '';
    this.verificationResult = null;

    try {
      // Use ApiService (returns Promise)
      const response = await this.api.verifyReceipt(data);
      this.verificationResult = response;
    } catch (error) {
      console.error(error);
      this.errorMessage = "Verification Failed: Could not connect to Audit Node.";
    } finally {
      this.isLoading = false;
    }
  }

  downloadProof() {
    if (!this.verificationResult) return;

    const isVerified = this.verificationResult.valid;
    const proofData = {
      recordType: "OBRIOXIA_VERIFICATION_PROOF",
      timestamp_verified: new Date().toISOString(),
      status: isVerified ? "VERIFIED" : "FAILED",
      details: this.verificationResult
    };

    const filename = `proof_${isVerified ? 'valid' : 'failed'}_${new Date().getTime()}.json`;
    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  reset() {
    this.verificationResult = null;
    this.errorMessage = '';
  }
}

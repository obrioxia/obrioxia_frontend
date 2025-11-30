import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HealthService } from '../services/health.service';
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
  
  // Backend URL
  private readonly API_URL = "https://obrioxia-backend-pkrp.onrender.com";

  isLoading = false;
  
  // CHANGED: We now expect a Single Result, not an Array
  verificationResult: any = null;
  
  errorMessage = '';
  isDragging = false;
  isSystemOnline = false;
  private healthSub: Subscription | null = null;

  constructor(private healthService: HealthService) {}

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

  // --- Drag & Drop Handlers ---

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

  // --- Logic Fix ---

  processFile(file: File) {
    const reader = new FileReader();
    
    reader.onload = async (e: any) => {
      try {
        const jsonContent = JSON.parse(e.target.result);
        
        // CRITICAL FIX: The backend expects ONE object.
        // If the file contains an Array (old format), we take the first item.
        // If the file contains an Object (standard format), we use it directly.
        
        let payloadToSend: any = null;

        if (Array.isArray(jsonContent) && jsonContent.length > 0) {
           payloadToSend = jsonContent[0];
        } else {
           payloadToSend = jsonContent;
        }

        // Safety Check: Does it have a hash?
        if(!payloadToSend || !payloadToSend.current_hash) {
            this.errorMessage = "Invalid JSON: File is missing cryptographic hash.";
            return;
        }

        await this.verifyChain(payloadToSend);

      } catch (err) {
        this.errorMessage = "Invalid File. Please upload a valid Obrioxia JSON receipt.";
        console.error(err);
      }
    };
    reader.readAsText(file);
  }

  async verifyChain(data: any) {
    this.isLoading = true;
    this.errorMessage = '';
    this.verificationResult = null;

    try {
      // We send the single object directly to the API
      const response = await fetch(`${this.API_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      // We expect a single response object back
      this.verificationResult = await response.json();

    } catch (error) {
      console.error(error);
      this.errorMessage = "Could not connect to the Audit Node. Verification failed.";
    } finally {
      this.isLoading = false;
    }
  }

  downloadProof() {
    if (!this.verificationResult) return;

    // Logic updated for Single Object response
    const isVerified = this.verificationResult.valid;

    const proofData = {
      recordType: "OBRIOXIA_VERIFICATION_PROOF",
      timestamp_verified: new Date().toISOString(),
      status: isVerified ? "VERIFIED" : "FAILED",
      // Include the full details from the backend response
      details: this.verificationResult
    };

    const filename = `proof_${isVerified ? 'valid' : 'failed'}_${new Date().getTime()}.json`;
    this.triggerDownload(proofData, filename);
  }

  private triggerDownload(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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

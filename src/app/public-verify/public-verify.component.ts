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
  
  private readonly API_URL = "https://obrioxia-backend-pkrp.onrender.com";

  isLoading = false;
  results: any[] | null = null;
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
        
        let payloadToSend: any[] = [];

        if (jsonContent.original_payload) {
           payloadToSend = [ jsonContent.original_payload ];
        } else if (Array.isArray(jsonContent)) {
           payloadToSend = jsonContent;
        } else {
           payloadToSend = [ jsonContent ];
        }

        await this.verifyChain(payloadToSend);

      } catch (err) {
        this.errorMessage = "Invalid JSON file. Please upload a valid Obrioxia receipt.";
      }
    };
    
    reader.readAsText(file);
  }

  async verifyChain(data: any) {
    this.isLoading = true;
    this.errorMessage = '';
    this.results = null;

    try {
      const response = await fetch(`${this.API_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Verification Server Error");

      this.results = await response.json();

    } catch (error) {
      console.error(error);
      this.errorMessage = "Could not connect to the Audit Node.";
    } finally {
      this.isLoading = false;
    }
  }

  downloadProof() {
    if (!this.results) return;

    const isVerified = this.results.some((r: any) => r.valid === true);

    const proofData = {
      recordType: "OBRIOXIA_VERIFICATION_PROOF",
      timestamp_verified: new Date().toISOString(),
      status: isVerified ? "VERIFIED" : "FAILED",
      integrity_check: "COMPLETE",
      verification_details: {
        total_records_checked: this.results.length,
        valid_records_found: this.results.filter((r: any) => r.valid).length
      },
      raw_results: this.results
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
    this.results = null;
    this.errorMessage = '';
  }
}

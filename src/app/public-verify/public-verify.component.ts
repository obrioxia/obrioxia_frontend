import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-public-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-verify.component.html',
  styleUrls: ['./public-verify.component.css']
})
export class PublicVerifyComponent {
  
  private readonly API_URL = "https://obrioxia-backend-pkrp.onrender.com";

  // State
  isLoading = false;
  results: any[] | null = null;
  errorMessage = '';
  isDragging = false;

  // --- FILE HANDLING ---
  
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
        await this.verifyChain(jsonContent);
      } catch (err) {
        this.errorMessage = "Invalid JSON file. Please upload a valid Obrioxia receipt.";
      }
    };
    
    reader.readAsText(file);
  }

  // --- API LOGIC ---
  async verifyChain(data: any) {
    this.isLoading = true;
    this.errorMessage = '';
    this.results = null;

    // Ensure data is an array
    const payload = Array.isArray(data) ? data : [data];

    try {
      const response = await fetch(`${this.API_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

  // --- PROOF GENERATION (NEW) ---
  downloadProof() {
    if (!this.results) return;

    const proofData = {
      recordType: "OBRIOXIA_VERIFICATION_PROOF",
      timestamp_verified: new Date().toISOString(),
      integrity_check: "COMPLETE",
      verification_results: this.results
    };

    const filename = `receipt_verification_${new Date().getTime()}.json`;
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

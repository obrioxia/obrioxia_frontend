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
  // ✅ Signal-based state for fine-grained UI updates
  isLoading = signal(false);
  verificationResult = signal<any>(null);
  errorMessage = signal('');
  
  isDragging = false;
  isSystemOnline = false;
  private healthSub: Subscription | null = null;

  constructor(
    private healthService: HealthService,
    private api: ApiService
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

  // ... drag and drop logic remains same ...

  processFile(file: File) {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      this.errorMessage.set("Error: Please upload the .json receipt file, not the PDF certificate.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const jsonContent = JSON.parse(e.target.result);
        const data = Array.isArray(jsonContent) ? jsonContent[0] : jsonContent;

        // ✅ TRIPLE-CHECK: We extract whatever key is available for the Python backend
        const identityKey = data.current_hash || data.decision_id || data.entry_hash;

        if(!identityKey) {
            this.errorMessage.set("Invalid Receipt: Missing cryptographic identity key.");
            return;
        }

        await this.verifyChain(identityKey);
      } catch (err) {
        this.errorMessage.set("Parsing Failed: Ensure the file is a valid Obrioxia receipt.");
      }
    };
    reader.readAsText(file);
  }

  async verifyChain(key: string) {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.verificationResult.set(null);

    try {
      // ✅ Handshake: Sending identity key to the v4.0 verification route
      const response = await this.api.verifyReceipt({ current_hash: key });
      this.verificationResult.set(response);
    } catch (error) {
      this.errorMessage.set("Handshake Failed: Audit Node unreachable or key invalid.");
    } finally {
      this.isLoading.set(false);
    }
  }

  reset() {
    this.verificationResult.set(null);
    this.errorMessage.set('');
  }
}

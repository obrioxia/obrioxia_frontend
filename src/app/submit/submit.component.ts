import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { HealthService } from '../services/health.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit.component.html'
})
export class SubmitComponent implements OnInit, OnDestroy {
  formData = {
    policyNumber: '',
    incidentType: 'Auto',
    claimAmount: 0,
    aiConfidenceScore: 0.95,
    agentId: 'AGENT-DEMO',
    decisionNotes: ''
  };

  // ✅ Signal-based state for "Silent" success notifications
  latestReceipt = signal<any>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  credits = signal(0);
  
  isDemoUser = false;
  isSystemOnline = false;
  private healthSub: Subscription | null = null;

  constructor(
    private api: ApiService, 
    public auth: AuthService,
    private healthService: HealthService
  ) {}

  ngOnInit() {
    const demoKey = localStorage.getItem('demo_key');
    this.isDemoUser = !!demoKey;
    if (this.isDemoUser && demoKey) this.checkDemoBalance(demoKey);

    this.checkHealth();
    this.healthSub = interval(10000).subscribe(() => this.checkHealth());
  }

  // ... cleanup and health logic ...

  async onSubmit() {
    if (this.isDemoUser && this.credits() <= 0) {
      this.errorMessage.set('Demo Limit Reached: Please upgrade for more credits.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.latestReceipt.set(null);

    try {
      const demoKey = localStorage.getItem('demo_key') || '';
      const res: any = await this.api.submitIncident(this.formData, demoKey);
      
      // ✅ SUCCESS: The UI will reactively show the "Entry Sealed" card via Signal
      this.latestReceipt.set(res);
      
      if (this.isDemoUser && res.credits_remaining !== undefined) {
        this.credits.set(res.credits_remaining);
      }
    } catch (error: any) {
      this.errorMessage.set(error.status === 402 ? '⛔ Credits Exhausted' : 'Submission Failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ... helper methods for downloads ...
}

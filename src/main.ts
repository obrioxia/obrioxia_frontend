import { Component, signal, inject, Injectable, Output, EventEmitter } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule, DatePipe, JsonPipe, CurrencyPipe } from '@angular/common';

// --- ICONS (Inline SVG for reliability) ---
@Component({
  selector: 'icon-shield',
  standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
}) export class IconShield {}

@Component({
  selector: 'icon-check-circle',
  standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
}) export class IconCheckCircle {}

@Component({
  selector: 'icon-lock',
  standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
}) export class IconLock {}

@Component({
  selector: 'icon-clock',
  standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
}) export class IconClock {}

@Component({
  selector: 'icon-file-text',
  standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
}) export class IconFileText {}

@Component({
  selector: 'icon-download',
  standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`
}) export class IconDownload {}

@Component({
  selector: 'icon-alert-triangle',
  standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
}) export class IconAlertTriangle {}

// --- DATA MODELS ---

export interface ClaimContext {
  claim_uuid: string;
  policy_number: string;
  incident_timestamp: string;
  fnol_timestamp: string;
  claim_type: string;
  jurisdiction: string;
  claimed_amount: number;
}

export interface AIEvent {
  event_type: 'AI_SCORING_COMPLETE';
  timestamp: string;
  actor_id: string;
  model_output: {
    fraud_score: number;
    risk_segment: string;
    reason_codes: string[];
    recommendation: string;
  };
  obrioxia_hash: string;
}

export interface HumanEvent {
  event_type: 'HUMAN_ADJUSTER_REVIEW';
  timestamp: string;
  actor_id: string;
  review_metrics: {
    time_delta_from_ai: string;
    file_open_duration: number; // seconds
    interaction_type: string;
  };
  decision: {
    action: string;
    notes: string;
    final_disposition: string;
  };
  obrioxia_hash: string;
}

export interface ClaimRecord {
  id: string;
  context: ClaimContext;
  ai_event: AIEvent;
  human_event?: HumanEvent; 
  status: 'PROCESSING' | 'FLAGGED' | 'REVIEWED' | 'DEFENSE_READY';
}

// --- MOCK DATA ---
const MOCK_CLAIMS: ClaimRecord[] = [
  {
    id: 'CLM-2025-AUTO-XJ9-004',
    status: 'DEFENSE_READY',
    context: {
      claim_uuid: 'CLM-2025-AUTO-XJ9-004',
      policy_number: 'POL-8823-CA-GOLD',
      incident_timestamp: '2025-02-14T08:30:00Z',
      fnol_timestamp: '2025-02-14T09:15:00Z',
      claim_type: 'AUTO_COLLISION',
      jurisdiction: 'CA',
      claimed_amount: 14500.00
    },
    ai_event: {
      event_type: 'AI_SCORING_COMPLETE',
      timestamp: '2025-02-14T09:15:05Z',
      actor_id: 'Model_FraudGuard_v2.4.1',
      model_output: {
        fraud_score: 0.88,
        risk_segment: 'HIGH',
        reason_codes: ['IMG_MISMATCH', 'HIGH_VELOCITY_CLAIM'],
        recommendation: 'DENY_REFER_TO_SIU'
      },
      obrioxia_hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    human_event: {
      event_type: 'HUMAN_ADJUSTER_REVIEW',
      timestamp: '2025-02-14T14:20:00Z',
      actor_id: 'ADJ-5542-L.Rivera',
      review_metrics: {
        time_delta_from_ai: '18295s',
        file_open_duration: 450,
        interaction_type: 'FULL_REVIEW'
      },
      decision: {
        action: 'OVERRIDE_DENIAL',
        notes: 'Claimant provided dashcam footage rebutting image mismatch. Risk accepted.',
        final_disposition: 'APPROVED'
      },
      obrioxia_hash: 'sha256:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
    }
  },
  {
    id: 'CLM-2025-PROP-A22-991',
    status: 'FLAGGED',
    context: {
      claim_uuid: 'CLM-2025-PROP-A22-991',
      policy_number: 'POL-1102-NY-PROP',
      incident_timestamp: '2025-02-15T10:00:00Z',
      fnol_timestamp: '2025-02-15T11:20:00Z',
      claim_type: 'PROPERTY_THEFT',
      jurisdiction: 'NY',
      claimed_amount: 4200.00
    },
    ai_event: {
      event_type: 'AI_SCORING_COMPLETE',
      timestamp: '2025-02-15T11:20:05Z',
      actor_id: 'Model_FraudGuard_v2.4.1',
      model_output: {
        fraud_score: 0.92,
        risk_segment: 'CRITICAL',
        reason_codes: ['RECENT_POLICY_CHANGE'],
        recommendation: 'DENY'
      },
      obrioxia_hash: 'sha256:72c8182743901b08e2025b903028301d017128372837'
    }
  }
];

// --- SERVICES ---

@Injectable({ providedIn: 'root' })
export class ObrioxiaService {
  claims = signal<ClaimRecord[]>(MOCK_CLAIMS);
  selectedClaimId = signal<string | null>('CLM-2025-AUTO-XJ9-004');

  getClaim(id: string) {
    return this.claims().find(c => c.id === id);
  }
}

// --- COMPONENTS ---

// 1. LANDING PAGE
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [IconShield, IconCheckCircle, IconLock, IconFileText, CommonModule],
  template: `
    <div class="bg-slate-900 text-white min-h-screen font-sans">
      <!-- Hero -->
      <div class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-slate-900 z-0"></div>
        <div class="max-w-7xl mx-auto px-6 py-24 relative z-10">
          <div class="flex flex-col md:flex-row items-center gap-12">
            <div class="md:w-1/2 space-y-8">
              <div class="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-700/50 px-3 py-1 rounded-full text-blue-200 text-sm font-medium animate-pulse">
                <div class="w-2 h-2 rounded-full bg-green-400"></div>
                Compliant with CA SB 1120 & EU AI Act
              </div>
              <h1 class="text-5xl font-bold tracking-tight leading-tight">
                Cryptographic Litigation Shield for <span class="text-blue-400">AI-Driven Claims</span>
              </h1>
              <p class="text-xl text-slate-400 leading-relaxed">
                The first evidence platform specifically designed to refute "1.2-second rubber stamp" allegations. 
                Prove meaningful human oversight with immutable chain-of-custody logging.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 pt-4">
                <button (click)="navigateToDemo.emit()" class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2">
                  <span class="w-5 h-5"><icon-shield/></span> Live Demo
                </button>
                <button class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2">
                  Run Validation Pilot (£1,500)
                </button>
              </div>
            </div>
            <div class="md:w-1/2">
              <div class="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-2 relative transform hover:scale-105 transition duration-500">
                <div class="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded shadow-lg uppercase tracking-wider z-20">
                  Defense Exhibit Ready
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border border-slate-600 w-full h-80 relative overflow-hidden flex flex-col justify-center">
                   
                   <div class="flex justify-between items-center mb-6 border-b border-slate-700 pb-2">
                        <span class="text-slate-400 text-xs uppercase">Verification Status</span>
                        <span class="text-green-400 text-xs font-bold flex items-center gap-1"><span class="w-3 h-3"><icon-check-circle/></span> VERIFIED</span>
                   </div>
                   
                   <!-- Visualization of "The Gap" -->
                   <div class="space-y-4">
                      <div class="flex items-center gap-4">
                          <div class="text-right w-24 text-xs text-slate-400">09:15:05</div>
                          <div class="w-8 h-8 rounded-full bg-red-900/50 text-red-500 flex items-center justify-center border border-red-500/50 text-xs font-bold">AI</div>
                          <div class="bg-slate-800 h-2 flex-1 rounded overflow-hidden relative">
                             <div class="absolute inset-0 bg-red-500/20"></div>
                          </div>
                          <div class="text-red-400 text-xs font-mono">0.32s Latency</div>
                      </div>

                      <div class="flex items-center gap-4">
                          <div class="text-right w-24 text-xs text-slate-400">14:20:00</div>
                          <div class="w-8 h-8 rounded-full bg-blue-900/50 text-blue-500 flex items-center justify-center border border-blue-500/50 text-xs font-bold"><icon-shield/></div>
                          <div class="bg-slate-800 h-2 flex-1 rounded overflow-hidden relative">
                             <div class="absolute inset-0 bg-blue-500 w-[80%]"></div>
                          </div>
                          <div class="text-green-400 text-xs font-mono font-bold">450s Review</div>
                      </div>
                   </div>

                   <div class="mt-8 p-3 bg-slate-800 rounded border border-slate-700 text-center">
                      <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Defense Exhibit Hash</div>
                      <div class="font-mono text-xs text-blue-400 truncate">sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
                   </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Grid -->
      <div class="max-w-7xl mx-auto px-6 py-20">
         <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-slate-800/50 p-8 rounded-xl border border-slate-700 hover:border-blue-500/50 transition duration-300">
               <div class="w-12 h-12 bg-blue-900/50 text-blue-400 rounded-lg p-3 mb-6"><icon-lock/></div>
               <h3 class="text-xl font-bold text-white mb-3">Immutable Logging</h3>
               <p class="text-slate-400">Anchors decision logs to RFC-3161 Time Stamping Authorities. Even your IT admins cannot retroactively alter the evidence.</p>
            </div>
            <div class="bg-slate-800/50 p-8 rounded-xl border border-slate-700 hover:border-blue-500/50 transition duration-300">
               <div class="w-12 h-12 bg-green-900/50 text-green-400 rounded-lg p-3 mb-6"><icon-shield/></div>
               <h3 class="text-xl font-bold text-white mb-3">Bad Faith Defense</h3>
               <p class="text-slate-400">Automatically calculates and cryptographically proves the "Review Duration" delta between AI recommendation and human action.</p>
            </div>
            <div class="bg-slate-800/50 p-8 rounded-xl border border-slate-700 hover:border-blue-500/50 transition duration-300">
               <div class="w-12 h-12 bg-purple-900/50 text-purple-400 rounded-lg p-3 mb-6"><icon-file-text/></div>
               <h3 class="text-xl font-bold text-white mb-3">Court-Ready Exports</h3>
               <p class="text-slate-400">Generate "Defense Exhibits" (ZIP/PDF) that serve as self-authenticating records under Federal Rules of Evidence 902(13).</p>
            </div>
         </div>
      </div>
    </div>
  `
})
export class LandingPageComponent {
  @Output() navigateToDemo = new EventEmitter<void>();
}


// 2. DASHBOARD / PIPELINE COMPONENT
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IconCheckCircle, IconClock],
  template: `
    <div class="p-8 max-w-7xl mx-auto min-h-screen">
      <header class="mb-8 flex justify-between items-end">
        <div>
            <h2 class="text-3xl font-bold text-slate-800">Claims Pipeline (FNOL Stream)</h2>
            <p class="text-slate-500 mt-2">Live monitoring of AI-scored claim events and human review status.</p>
        </div>
        <div class="text-right">
            <div class="text-sm font-bold text-slate-400 uppercase">System Status</div>
            <div class="flex items-center gap-2 text-green-600 font-bold">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Active Anchoring
            </div>
        </div>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Claim ID / Policy</th>
              <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Incident Date</th>
              <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Assessment</th>
              <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Review Status</th>
              <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (claim of claims(); track claim.id) {
              <tr class="hover:bg-slate-50 transition">
                <td class="p-4">
                  <div class="font-medium text-slate-900">{{claim.id}}</div>
                  <div class="text-sm text-slate-500">{{claim.context.policy_number}}</div>
                </td>
                <td class="p-4 text-slate-600">
                  {{claim.context.incident_timestamp | date:'shortDate'}}
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <span [class]="claim.ai_event.model_output.risk_segment === 'HIGH' || claim.ai_event.model_output.risk_segment === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'" class="px-2 py-1 rounded text-xs font-bold">
                      {{claim.ai_event.model_output.risk_segment}}
                    </span>
                    <span class="text-xs text-slate-500 font-mono">Score: {{claim.ai_event.model_output.fraud_score}}</span>
                  </div>
                </td>
                <td class="p-4">
                  @switch (claim.status) {
                    @case ('DEFENSE_READY') {
                      <div class="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <span class="w-4 h-4"><icon-check-circle/></span> Defense Ready
                      </div>
                    }
                    @case ('FLAGGED') {
                      <div class="flex items-center gap-2 text-amber-600 text-sm font-medium">
                        <span class="w-4 h-4"><icon-clock/></span> Pending Review
                      </div>
                    }
                  }
                </td>
                <td class="p-4 text-right">
                  <button (click)="viewClaim.emit(claim.id)" class="text-blue-600 hover:text-blue-800 text-sm font-semibold border border-blue-200 hover:bg-blue-50 px-3 py-1 rounded transition">
                    View Chain &rarr;
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DashboardComponent {
  claims = inject(ObrioxiaService).claims;
  @Output() viewClaim = new EventEmitter<string>();
}

// 3. CLAIM DETAIL / TIMELINE COMPONENT
@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [CommonModule, JsonPipe, DatePipe, CurrencyPipe, IconShield, IconLock, IconDownload, IconCheckCircle, IconClock],
  template: `
    <div class="p-8 max-w-7xl mx-auto animate-fade-in min-h-screen">
      <button (click)="goBack.emit()" class="mb-6 text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium">
        &larr; Back to Pipeline
      </button>

      @if (claim) {
        <div class="flex flex-col lg:flex-row gap-8">
          
          <!-- LEFT COLUMN: CONTEXT & TIMELINE -->
          <div class="lg:w-2/3 space-y-6">
            
            <!-- Context Card -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div class="flex justify-between items-start mb-4">
                  <div>
                    <h1 class="text-2xl font-bold text-slate-900">Decision Lifecycle Reconstruction</h1>
                    <p class="text-slate-500 text-sm mt-1">Claim: {{claim.id}}</p>
                  </div>
                  <div class="text-right">
                     <div class="text-2xl font-mono text-slate-700 font-bold">{{claim.context.claimed_amount | currency:'GBP'}}</div>
                     <span class="text-xs text-slate-400 uppercase tracking-wide">Claimed Amount</span>
                  </div>
               </div>
               <div class="grid grid-cols-3 gap-4 text-sm">
                  <div class="bg-slate-50 p-3 rounded border border-slate-100">
                    <div class="text-slate-400 text-xs uppercase mb-1">Policy Type</div>
                    <div class="font-semibold text-slate-700">{{claim.context.claim_type}}</div>
                  </div>
                  <div class="bg-slate-50 p-3 rounded border border-slate-100">
                    <div class="text-slate-400 text-xs uppercase mb-1">Jurisdiction</div>
                    <div class="font-semibold text-slate-700">{{claim.context.jurisdiction}}</div>
                  </div>
                  <div class="bg-slate-50 p-3 rounded border border-slate-100">
                    <div class="text-slate-400 text-xs uppercase mb-1">Claimant Tenure</div>
                    <div class="font-semibold text-slate-700">4 Months</div>
                  </div>
               </div>
            </div>

            <!-- Timeline -->
            <div class="relative pl-8 border-l-2 border-slate-200 space-y-12 py-4">
              
              <!-- Event 1: AI Scoring -->
              <div class="relative">
                 <div class="absolute -left-[41px] bg-red-100 p-2 rounded-full border-4 border-slate-50 shadow-sm text-red-600 w-10 h-10 flex items-center justify-center z-10">
                    <span class="font-bold text-xs">AI</span>
                 </div>
                 <div class="bg-white p-5 rounded-lg border border-red-200 shadow-sm relative group">
                    <div class="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-b border-red-200 transform rotate-45"></div>
                    <div class="flex justify-between items-start">
                       <div>
                          <h4 class="font-bold text-slate-900">AI Fraud Scoring Complete</h4>
                          <p class="text-xs text-slate-500 mt-1">{{claim.ai_event.timestamp | date:'medium'}}</p>
                       </div>
                       <span class="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">High Risk</span>
                    </div>
                    <div class="mt-3 text-sm text-slate-600">
                       <p><span class="font-semibold">Model:</span> {{claim.ai_event.actor_id}}</p>
                       <p><span class="font-semibold">Reason Codes:</span> {{claim.ai_event.model_output.reason_codes.join(', ')}}</p>
                       <p class="mt-2 text-red-700 font-semibold bg-red-50 p-2 rounded">Rec: {{claim.ai_event.model_output.recommendation}}</p>
                    </div>
                    <div class="mt-3 pt-3 border-t border-slate-100 text-xs font-mono text-slate-400 truncate flex items-center gap-2">
                       <span class="w-3 h-3"><icon-lock/></span> Hash: {{claim.ai_event.obrioxia_hash}}
                    </div>
                 </div>
              </div>

              <!-- TIME DELTA VISUALIZATION -->
              @if (claim.human_event) {
                <div class="relative pl-4">
                   <div class="flex items-center gap-3 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200 w-fit shadow-sm">
                      <div class="w-5 h-5"><icon-clock/></div>
                      <div>
                        <div class="text-[10px] uppercase font-bold tracking-wider text-green-700">Review Duration Proven</div>
                        <div class="text-lg font-mono font-bold">{{ formatDuration(claim.human_event.review_metrics.file_open_duration) }}</div>
                      </div>
                   </div>
                   <!-- Visual dashed line connector handled by parent border -->
                </div>

                <!-- Event 2: Human Review -->
                <div class="relative">
                   <div class="absolute -left-[41px] bg-blue-100 p-2 rounded-full border-4 border-slate-50 shadow-sm text-blue-600 w-10 h-10 flex items-center justify-center z-10">
                      <span class="w-5 h-5"><icon-shield/></span>
                   </div>
                   <div class="bg-white p-5 rounded-lg border border-blue-200 shadow-sm relative">
                      <div class="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-b border-blue-200 transform rotate-45"></div>
                      <div class="flex justify-between items-start">
                         <div>
                            <h4 class="font-bold text-slate-900">Human Adjuster Final Decision</h4>
                            <p class="text-xs text-slate-500 mt-1">{{claim.human_event.timestamp | date:'medium'}}</p>
                         </div>
                         <span class="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">Override</span>
                      </div>
                      <div class="mt-3 text-sm text-slate-600">
                         <p><span class="font-semibold">Adjuster:</span> {{claim.human_event.actor_id}}</p>
                         <div class="mt-2 bg-slate-50 p-3 rounded italic text-slate-700 border-l-4 border-blue-300">"{{claim.human_event.decision.notes}}"</div>
                      </div>
                      <div class="mt-3 pt-3 border-t border-slate-100 text-xs font-mono text-slate-400 truncate flex items-center gap-2">
                         <span class="w-3 h-3"><icon-lock/></span> Hash: {{claim.human_event.obrioxia_hash}}
                      </div>
                   </div>
                </div>
              }

            </div>
          </div>

          <!-- RIGHT COLUMN: CHAIN OF CUSTODY & EXPORT -->
          <div class="lg:w-1/3 space-y-6">
            
            <!-- Verification Status -->
            <div class="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
               <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <div class="w-48 h-48"><icon-shield/></div>
               </div>
               <h3 class="text-lg font-bold mb-1">Chain of Custody</h3>
               <div class="text-green-400 text-sm font-bold flex items-center gap-2 mb-6">
                  <div class="w-4 h-4"><icon-check-circle/></div>
                  INTACT & ANCHORED
               </div>
               <div class="space-y-0">
                  <div class="flex items-center gap-3 text-sm text-slate-300 relative z-10">
                    <div class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700 text-xs font-mono text-slate-400">01</div>
                    <div class="truncate font-mono text-xs opacity-70">Block: ...92427ae41e</div>
                  </div>
                  <div class="h-6 w-0.5 bg-slate-700 ml-4"></div>
                   <div class="flex items-center gap-3 text-sm text-slate-300 relative z-10">
                    <div class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700 text-xs font-mono text-slate-400">02</div>
                    <div class="truncate font-mono text-xs opacity-70">Block: ...85afee48bb</div>
                  </div>
               </div>
               <div class="mt-8 pt-4 border-t border-slate-700 relative z-10">
                  <p class="text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">Defense Actions</p>
                  <button class="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-green-900/20">
                     <span class="w-4 h-4"><icon-download/></span> Export Defense Exhibit
                  </button>
                  <p class="text-[10px] text-slate-500 mt-2 text-center">Contains JSON logs, Merkle Proof, and PDF Summary per FRE 902(13).</p>
               </div>
            </div>

            <!-- JSON Preview -->
             <div class="bg-white p-4 rounded-xl border border-slate-200">
                <h4 class="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                   <div class="w-4 h-4"><icon-file-text/></div> Raw Event Log
                </h4>
                <div class="relative">
                  <pre class="bg-slate-50 p-3 rounded text-[10px] overflow-x-auto font-mono text-slate-600 max-h-64 border border-slate-200">{{ claim.human_event | json }}</pre>
                  <div class="absolute top-2 right-2 text-[10px] text-slate-400 font-mono">JSON</div>
                </div>
             </div>

          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ClaimDetailComponent {
  claim = inject(ObrioxiaService).getClaim(inject(ObrioxiaService).selectedClaimId() || ''); 
  @Output() goBack = new EventEmitter<void>();

  formatDuration(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  }
}

// 4. VERIFY PAGE
@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, IconCheckCircle, IconDownload, IconFileText],
  template: `
    <div class="bg-slate-50 min-h-screen p-8 flex flex-col items-center justify-center">
       <div class="max-w-2xl w-full">
         <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-slate-900">Verify Defense Exhibit</h1>
            <p class="text-slate-500 mt-2">Independent integrity check for auditors, regulators, and opposing counsel.</p>
         </div>

         <div 
            class="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-16 text-center hover:border-blue-500 hover:bg-blue-50/10 transition cursor-pointer group shadow-sm"
            (click)="verify()"
         >
             @if (!verified) {
                <div class="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition shadow-sm">
                   <div class="w-10 h-10"><icon-download/></div>
                </div>
                <h3 class="text-xl font-bold text-slate-700">Drop Evidence Pack (ZIP) Here</h3>
                <p class="text-slate-400 text-sm mt-2">or click to browse local files</p>
             } @else {
                <div class="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-sm">
                   <div class="w-12 h-12"><icon-check-circle/></div>
                </div>
                <h3 class="text-3xl font-bold text-green-700">VERIFIED INTEGRITY</h3>
                <p class="text-slate-600 mt-2 text-lg">The digital signature matches the timestamped record anchored on Feb 14, 2025.</p>
                
                <div class="mt-8 bg-slate-50 p-6 rounded-xl text-left border border-slate-200 shadow-inner">
                   <div class="text-xs text-slate-500 uppercase font-bold mb-4 tracking-wider border-b border-slate-200 pb-2">Chain Details</div>
                   <div class="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                      <div><span class="text-slate-400 block text-xs uppercase mb-1">Anchor Provider</span> <span class="font-mono text-slate-800 font-semibold">DigiCert TSA</span></div>
                      <div><span class="text-slate-400 block text-xs uppercase mb-1">Algorithm</span> <span class="font-mono text-slate-800 font-semibold">SHA-256</span></div>
                      <div class="col-span-2"><span class="text-slate-400 block text-xs uppercase mb-1">Root Hash</span> <span class="font-mono text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 block truncate">8f4a3d82...99b1</span></div>
                      <div class="col-span-2 pt-2 border-t border-slate-200 mt-2 flex justify-between items-center">
                        <span class="text-slate-500">Status</span>
                        <span class="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full text-xs">UNALTERED</span>
                      </div>
                   </div>
                </div>
                <button (click)="verified = false" class="mt-8 text-sm text-slate-400 hover:text-slate-600 underline">Verify another file</button>
             }
         </div>
       </div>
    </div>
  `
})
export class VerifyComponent {
  verified = false;
  verify() {
    this.verified = true;
  }
}

// 5. DOCS PAGE
@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto p-12 font-sans text-slate-800 min-h-screen">
       <div class="mb-12 border-b border-slate-200 pb-8">
        <h1 class="text-4xl font-bold mb-4 text-slate-900">Obrioxia Python SDK</h1>
        <p class="text-xl text-slate-600">Integrate cryptographic chain-of-custody logging into your insurance claims pipeline.</p>
       </div>

       <div class="space-y-16">
          
          <section>
             <h2 class="text-2xl font-bold mb-4 flex items-center gap-3">
                <span class="bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-full text-sm font-mono">1</span>
                Installation
             </h2>
             <div class="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm border border-slate-700 shadow-lg">
                pip install obrioxia-claims
             </div>
          </section>

          <section>
             <h2 class="text-2xl font-bold mb-4 flex items-center gap-3">
                <span class="bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-full text-sm font-mono">2</span>
                Log AI Scoring Event
             </h2>
             <p class="mb-4 text-slate-600">Call this immediately after your model (e.g., AWS SageMaker, DataRobot) generates a fraud score.</p>
             <div class="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm overflow-x-auto border border-slate-700 shadow-lg">
<pre>from obrioxia import ClaimsShield

shield = ClaimsShield(api_key="obs_live_...")

# Capture Model Output
shield.log_ai_event(
    claim_id="CLM-2025-AUTO-XJ9",
    model_id="FraudGuard_v2",
    output=&#123;
        "fraud_score": 0.88,
        "recommendation": "DENY"
    &#125;
)</pre>
             </div>
          </section>

          <section>
             <h2 class="text-2xl font-bold mb-4 flex items-center gap-3">
                <span class="bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-full text-sm font-mono">3</span>
                Log Human Review (Critical)
             </h2>
             <p class="mb-4 text-slate-600">This closes the loop and calculates the defensible duration for SB 1120 compliance.</p>
             <div class="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm overflow-x-auto border border-slate-700 shadow-lg">
<pre># When adjuster submits final decision
shield.log_human_review(
    claim_id="CLM-2025-AUTO-XJ9",
    adjuster_id="ADJ-5542",
    decision="OVERRIDE_APPROVED",
    metrics=&#123;
        "file_open_duration_sec": 450, # Vital for Bad Faith Defense
        "interaction_type": "FULL_REVIEW"
    &#125;
)</pre>
             </div>
          </section>

       </div>
    </div>
  `
})
export class DocsComponent {}


// MAIN APP SHELL
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LandingPageComponent, DashboardComponent, ClaimDetailComponent, VerifyComponent, DocsComponent, IconShield],
  template: `
    <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <!-- NAV -->
      <nav class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-8">
            <div class="text-xl font-bold tracking-tight cursor-pointer flex items-center gap-2 hover:text-blue-400 transition" (click)="page.set('LANDING')">
              <div class="w-6 h-6 text-blue-500">
                 <icon-shield/>
              </div>
              Obrioxia <span class="text-slate-500 font-normal">| Claims Shield</span>
            </div>
            <div class="hidden md:flex gap-6 text-sm font-medium text-slate-300">
              <a (click)="page.set('LANDING')" [class.text-white]="page() === 'LANDING'" class="hover:text-white cursor-pointer transition">Product</a>
              <a (click)="page.set('DASHBOARD')" [class.text-white]="page() === 'DASHBOARD' || page() === 'DETAIL'" class="hover:text-white cursor-pointer transition">Console</a>
              <a (click)="page.set('DOCS')" [class.text-white]="page() === 'DOCS'" class="hover:text-white cursor-pointer transition">Developers</a>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button (click)="page.set('VERIFY')" class="text-sm text-slate-300 hover:text-white transition flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-green-500"></span> Public Verify
            </button>
            <button class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-semibold transition shadow-lg shadow-blue-900/20">Sign In</button>
          </div>
        </div>
      </nav>

      <!-- ROUTER (Manual Switch) -->
      <main>
        @switch (page()) {
          @case ('LANDING') { <app-landing (navigateToDemo)="page.set('DASHBOARD')" /> }
          @case ('DASHBOARD') { <app-dashboard (viewClaim)="selectClaim($event)" /> }
          @case ('DETAIL') { <app-claim-detail (goBack)="page.set('DASHBOARD')" /> }
          @case ('VERIFY') { <app-verify /> }
          @case ('DOCS') { <app-docs /> }
        }
      </main>

      <!-- FOOTER -->
      <footer class="bg-slate-900 border-t border-slate-800 text-slate-500 py-12 text-sm mt-auto">
        <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
           <div>
             <div class="font-bold text-white mb-4">Obrioxia</div>
             <p>Cryptographic evidence for the AI era.</p>
           </div>
           <div>
             <div class="font-bold text-white mb-4">Platform</div>
             <ul class="space-y-2">
               <li>Insurance Shield</li>
               <li>HR Compliance</li>
               <li>API Docs</li>
             </ul>
           </div>
           <div>
             <div class="font-bold text-white mb-4">Company</div>
             <ul class="space-y-2">
               <li>About</li>
               <li>Careers</li>
               <li>Legal</li>
             </ul>
           </div>
           <div>
             <div class="font-bold text-white mb-4">Contact</div>
             <p>london&#64;obrioxia.com</p>
           </div>
        </div>
      </footer>

    </div>
  `
})
export class App {
  page = signal<'LANDING' | 'DASHBOARD' | 'DETAIL' | 'VERIFY' | 'DOCS'>('LANDING');
  obrioxiaService = inject(ObrioxiaService);

  selectClaim(id: string) {
    this.obrioxiaService.selectedClaimId.set(id);
    this.page.set('DETAIL');
  }
}

bootstrapApplication(App);



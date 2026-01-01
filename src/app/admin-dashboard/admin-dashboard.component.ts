import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

// ✅ PRODUCTION IMPORTS: These will work now that we fixed the install
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, Chart, registerables } from 'chart.js';

// Register Chart components
Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  // ✅ Full Imports including Charts
  imports: [CommonModule, FormsModule, BaseChartDirective], 
  template: `
    <div class="dashboard-container p-6 bg-black min-h-screen text-white font-sans">
      
      <header class="mb-8 border-b border-red-500/20 pb-4 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 class="text-3xl font-orbitron text-red-500 tracking-wider">ROOT ADMINISTRATION</h1>
          <p class="text-gray-400 font-mono text-sm">System Authority Level: <span class="text-white font-bold">MAXIMUM</span></p>
        </div>
        
        <div class="flex gap-3 w-full md:w-auto">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (keyup.enter)="onSearch()"
            placeholder="SEARCH HASH / POLICY..." 
            class="bg-black border border-red-500/30 text-red-400 px-4 py-2 rounded font-mono text-sm focus:outline-none focus:border-red-500 w-full md:w-64"
          >
          
          <button (click)="triggerUpload(fileInput)" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold font-orbitron text-sm transition-colors whitespace-nowrap">
            {{ isUploading ? 'UPLOADING...' : 'UPLOAD CSV' }}
          </button>
          <input #fileInput type="file" (change)="handleCsvUpload($event)" accept=".csv" class="hidden">
          
          <button (click)="logout()" class="border border-red-500 text-red-500 hover:bg-red-900/20 px-4 py-2 rounded font-bold font-orbitron text-sm">
            LOGOUT
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="p-4 bg-white/5 border border-red-500/30 rounded-xl">
          <h5 class="text-gray-400 text-xs font-mono mb-2">Total Records</h5>
          <h2 class="text-4xl font-bold font-orbitron text-white">{{ totalRecords }}</h2>
        </div>
        <div class="p-4 bg-white/5 border border-red-500/30 rounded-xl">
          <h5 class="text-gray-400 text-xs font-mono mb-2">System Status</h5>
          <h2 class="text-4xl font-bold font-orbitron text-green-500">ONLINE</h2>
        </div>
        <div class="p-4 bg-white/5 border border-red-500/30 rounded-xl">
          <h5 class="text-gray-400 text-xs font-mono mb-2">Pending Batches</h5>
          <h2 class="text-4xl font-bold font-orbitron text-yellow-500">0</h2>
        </div>
        <div class="p-4 bg-white/5 border border-red-500/30 rounded-xl">
          <h5 class="text-gray-400 text-xs font-mono mb-2">Error Rate</h5>
          <h2 class="text-4xl font-bold font-orbitron text-red-400">0.00%</h2>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="col-span-2 bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-black"></div>
          <h4 class="font-orbitron mb-4 text-lg text-red-400">Network Topology</h4>
          <div style="display: block; height: 300px;">
            <canvas baseChart
              [type]="'line'"
              [data]="adminChartData"
              [options]="adminChartOptions">
            </canvas>
          </div>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col">
          <h4 class="font-orbitron mb-4 text-lg text-red-400">Ledger Data</h4>
          
          <div *ngIf="errorMessage" class="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">
            {{ errorMessage }}
          </div>

          <div class="flex-1 overflow-auto custom-scrollbar" style="max-height: 280px;">
            <table class="w-full text-left border-collapse">
              <thead class="text-xs text-gray-500 font-mono border-b border-white/10">
                <tr>
                  <th class="py-2">HASH</th>
                  <th class="py-2 text-right">AMOUNT</th>
                  <th class="py-2 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let incident of incidents" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td class="py-3 font-mono text-xs text-obrioxia-cyan">
                    {{ formatHash(incident.incident_id || incident.id) }}
                  </td>
                  <td class="py-3 text-right font-bold text-white text-sm">
                    {{ getAmount(incident) }}
                  </td>
                  <td class="py-3 text-center">
                    <button (click)="openModal(incident)" class="text-[10px] bg-red-900/50 text-red-400 border border-red-800 px-2 py-1 rounded hover:bg-red-800 hover:text-white transition-all">
                      VIEW
                    </button>
                  </td>
                </tr>
                <tr *ngIf="incidents.length === 0 && !isLoading">
                  <td colspan="3" class="text-center py-8 text-gray-500 text-sm">
                    No records found.
                  </td>
                </tr>
                 <tr *ngIf="isLoading">
                  <td colspan="3" class="text-center py-8 text-gray-500 text-sm animate-pulse">
                    Syncing with blockchain...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 flex justify-between items-center pt-4 border-t border-white/10">
            <button (click)="changePage(-1)" [disabled]="currentPage === 1" class="text-xs font-mono text-gray-400 hover:text-white disabled:opacity-50">
              < PREV
            </button>
            <span class="text-xs font-mono text-gray-500">PAGE {{ currentPage }}</span>
            <button (click)="changePage(1)" [disabled]="incidents.length < pageSize" class="text-xs font-mono text-gray-400 hover:text-white disabled:opacity-50">
              NEXT >
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-gray-900 border border-red-500 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
          <div class="bg-red-900/20 p-4 border-b border-red-500/30 flex justify-between items-center">
             <h3 class="text-red-400 font-orbitron text-lg">RECORD DETAILS</h3>
             <button (click)="closeModal()" class="text-gray-400 hover:text-white">✕</button>
          </div>
          <div class="p-6 space-y-4">
             <div *ngIf="selectedIncident">
               <div class="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <label class="text-gray-500 text-xs block mb-1">POLICY NUMBER</label>
                   <div class="font-mono text-white">{{ getPolicy(selectedIncident) }}</div>
                 </div>
                 <div>
                   <label class="text-gray-500 text-xs block mb-1">CLAIM AMOUNT</label>
                   <div class="font-mono text-green-400 font-bold">{{ getAmount(selectedIncident) }}</div>
                 </div>
                 <div class="col-span-2">
                   <label class="text-gray-500 text-xs block mb-1">FULL HASH</label>
                   <div class="font-mono text-xs text-gray-300 break-all bg-black/50 p-2 rounded border border-white/10">
                     {{ selectedIncident.incident_id || selectedIncident.id }}
                   </div>
                 </div>
                 <div class="col-span-2">
                   <label class="text-gray-500 text-xs block mb-1">RAW DATA</label>
                   <pre class="bg-black/50 p-2 rounded text-[10px] text-gray-400 overflow-auto max-h-32 border border-white/10">{{ selectedIncident.data | json }}</pre>
                 </div>
               </div>
             </div>
          </div>
          <div class="p-4 bg-black/30 text-right">
             <button (click)="closeModal()" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors">CLOSE</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #111; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #ef4444; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #dc2626; }
  `]
})
export class AdminDashboardComponent implements OnInit {

  // Logic
  incidents: any[] = [];
  totalRecords = 0;
  isLoading = false;
  isUploading = false;
  errorMessage = '';
  
  searchQuery = '';
  currentPage = 1;
  pageSize = 20;

  selectedIncident: any = null;
  showModal = false;

  // ✅ Chart Data (Red Theme for Admin)
  public adminChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        data: [120, 150, 180, 240, 200, 280, 310],
        label: 'Network Load',
        fill: true,
        tension: 0.3,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        pointBackgroundColor: '#fff'
      }
    ]
  };
  
  public adminChartOptions: ChartOptions<'line'> = { 
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
        x: { grid: { display: false }, ticks: { color: '#666' } }
    }
  };

  constructor(
    private api: ApiService, 
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const res: any = await this.api.getAdminIncidents(this.currentPage, this.pageSize, this.searchQuery);
      this.incidents = res.data || [];
      this.totalRecords = res.total || 0;
    } catch (err: any) {
      console.error("Dashboard Load Error:", err);
      if (err.status === 401 || err.status === 403) {
         this.errorMessage = "Session Expired. Please log in again.";
      } else {
         this.errorMessage = "Connection Error. Could not load ledger.";
      }
    } finally {
      this.isLoading = false;
    }
  }

  onSearch() {
    this.currentPage = 1; 
    this.loadData();
  }

  changePage(delta: number) {
    const newPage = this.currentPage + delta;
    if (newPage < 1) return;
    this.currentPage = newPage;
    this.loadData();
  }

  triggerUpload(input: HTMLInputElement) {
    input.click();
  }

  async handleCsvUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    try {
      const res: any = await this.api.uploadBatch(file);
      alert(`Batch Complete: ${res.processed} records processed.`);
      this.loadData();
    } catch (e) {
      alert("Upload failed. Check CSV format.");
    } finally {
      this.isUploading = false;
    }
  }

  openModal(incident: any) {
    this.selectedIncident = incident;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedIncident = null;
  }

  logout() {
    this.auth.signOut().then(() => this.router.navigate(['/']));
  }

  formatHash(hash: string): string {
    if (!hash) return '---';
    return hash.substring(0, 8) + '...' + hash.substring(hash.length - 8);
  }

  getPolicy(incident: any): string {
    return incident.data?.policy_number || 'N/A';
  }

  getAmount(incident: any): string {
    return incident.data?.claim_amount ? `$${incident.data.claim_amount}` : '$0';
  }
}

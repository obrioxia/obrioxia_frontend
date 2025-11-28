import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0a] text-gray-200 p-8">
      <div class="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 class="text-3xl font-bold text-white font-orbitron tracking-wide">SYSTEM LEDGER</h1>
          <p class="text-gray-500 text-sm mt-1">Immutable Chain Browser</p>
        </div>
        <button (click)="auth.logout()" class="text-red-400 hover:text-white text-sm border border-red-900/50 hover:bg-red-900/20 px-4 py-2 rounded transition-colors">
          LOGOUT
        </button>
      </div>

      <div class="max-w-7xl mx-auto mb-6 flex gap-4">
        <input 
          [(ngModel)]="filter" 
          (keyup.enter)="page=1; loadData()"
          placeholder="Search Policy #" 
          class="bg-[#111] border border-gray-700 text-white px-4 py-2 rounded w-64 focus:border-cyan-500 outline-none"
        >
        <button (click)="page=1; loadData()" class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
          Search
        </button>
      </div>

      <div class="max-w-7xl mx-auto bg-[#111] border border-gray-800 rounded-lg overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-400">
            <thead class="bg-black text-gray-200 uppercase font-mono text-xs">
              <tr>
                <th class="px-6 py-4">Seq</th>
                <th class="px-6 py-4">Timestamp</th>
                <th class="px-6 py-4">Policy Number</th>
                <th class="px-6 py-4">Type</th>
                <th class="px-6 py-4">Current Hash</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800 font-mono">
              <tr *ngFor="let row of rows" class="hover:bg-gray-900 transition-colors">
                <td class="px-6 py-4 text-cyan-500">{{ row.sequence }}</td>
                <td class="px-6 py-4">{{ row.timestamp }}</td>
                <td class="px-6 py-4 text-white">{{ row.policy_number }}</td>
                <td class="px-6 py-4">{{ row.incident_type }}</td>
                <td class="px-6 py-4 text-xs text-gray-600">
                  {{ row.current_hash | slice:0:16 }}...
                </td>
              </tr>
              <tr *ngIf="rows.length === 0 && !isLoading">
                <td colspan="5" class="px-6 py-8 text-center text-gray-600">No records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="bg-black border-t border-gray-800 px-6 py-4 flex justify-between items-center">
          <button (click)="changePage(-1)" [disabled]="page === 1" class="text-gray-400 hover:text-white disabled:opacity-30">
            ← PREV
          </button>
          <span class="text-xs text-gray-500">Page {{ page }}</span>
          <button (click)="changePage(1)" [disabled]="rows.length < pageSize" class="text-gray-400 hover:text-white disabled:opacity-30">
            NEXT →
          </button>
        </div>
      </div>
      
      <div *ngIf="isLoading" class="text-center mt-4 text-cyan-500 animate-pulse">Loading Ledger Data...</div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  rows: any[] = [];
  page = 1;
  pageSize = 20;
  filter = '';
  isLoading = false;

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      const res: any = await this.api.getAdminIncidents(this.page, this.pageSize, this.filter);
      this.rows = res.data;
    } catch (e) {
      console.error(e);
      alert('Failed to load data. Ensure you are logged in.');
    } finally {
      this.isLoading = false;
    }
  }

  changePage(delta: number) {
    this.page += delta;
    this.loadData();
  }
}

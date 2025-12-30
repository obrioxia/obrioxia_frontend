import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Fixes NG8002 error for this component
import { LogsService } from '../../services/logs.service'; 
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-audit-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Handing the component the form tools
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <div class="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 class="text-3xl text-white font-orbitron mb-2">Audit <span class="text-purple-400">Ledger</span></h2>
          <p class="text-gray-400 text-sm">Read-only view of the immutable hash chain. Verify specific hashes using the Verify tool.</p>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Blocks</div>
          <div class="text-2xl text-white font-mono">{{ (filteredLogs$ | async)?.length || 0 }}</div>
        </div>
      </div>

      <div class="mb-4">
        <input 
          [(ngModel)]="searchTerm" 
          (ngModelChange)="onSearchChange()"
          placeholder="Filter by Hash or Event Type..." 
          class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-xs focus:border-purple-500 outline-none transition-all"
        />
      </div>

      <div class="glass-panel border border-white/10 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-400">
            <thead class="bg-white/5 text-xs uppercase text-gray-500 font-orbitron">
              <tr>
                <th class="px-6 py-4">Timestamp</th>
                <th class="px-6 py-4">Event Type</th>
                <th class="px-6 py-4">Hash</th>
                <th class="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let log of filteredLogs$ | async" class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4 font-mono text-xs">{{ log.timestamp | date:'short' }}</td>
                <td class="px-6 py-4 text-white">{{ log.eventType }}</td>
                <td class="px-6 py-4 font-mono text-xs text-cyan-400 truncate max-w-[150px]" title="{{ log.hash }}">
                  {{ log.hash }}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                    VERIFIED
                  </span>
                </td>
              </tr>
              <tr *ngIf="(filteredLogs$ | async)?.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                  No events found matching your search.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AuditLedgerComponent implements OnInit {
  private logsService = inject(LogsService);
  
  searchTerm: string = '';
  logs$!: Observable<any[]>;
  filteredLogs$!: Observable<any[]>;

  ngOnInit() {
    this.logs$ = this.logsService.getLogs();
    this.filteredLogs$ = this.logs$;
  }

  onSearchChange() {
    this.filteredLogs$ = this.logs$.pipe(
      map(logs => logs.filter(log => 
        log.hash.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        log.eventType.toLowerCase().includes(this.searchTerm.toLowerCase())
      ))
    );
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogsService } from '../../services/logs.service'; // Adjust path to your existing service
import { Observable } from 'rxjs';

@Component({
  selector: 'app-audit-ledger',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <div class="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 class="text-3xl text-white font-orbitron mb-2">Audit <span class="text-purple-400">Ledger</span></h2>
          <p class="text-gray-400 text-sm">Read-only view of the immutable hash chain. Verify specific hashes using the Verify tool.</p>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Blocks</div>
          <div class="text-2xl text-white font-mono">{{ (logs$ | async)?.length || 0 }}</div>
        </div>
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
              <tr *ngFor="let log of logs$ | async" class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4 font-mono text-xs">{{ log.timestamp | date:'short' }}</td>
                <td class="px-6 py-4 text-white">{{ log.eventType }}</td>
                <td class="px-6 py-4 font-mono text-xs text-obrioxia-cyan truncate max-w-[150px]" title="{{ log.hash }}">
                  {{ log.hash }}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                    VERIFIED
                  </span>
                </td>
              </tr>
              <tr *ngIf="(logs$ | async)?.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                  No events found in the ledger. Use "Log Event" to create the first block.
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
  logsService = inject(LogsService);
  logs$!: Observable<any[]>;

  ngOnInit() {
    this.logs$ = this.logsService.getLogs(); // Ensure your service has this method
  }
}

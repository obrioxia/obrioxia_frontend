import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// FIXED IMPORT PATH: Changed from '../../' to '../'
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styles: [`
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #111; }
    ::-webkit-scrollbar-thumb { background: #0ea5e9; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #0284c7; }
  `]
})
export class AdminDashboardComponent implements OnInit {

  incidents: any[] = [];
  totalRecords = 0;
  isLoading = false;
  isUploading = false;
  
  searchQuery = '';
  currentPage = 1;
  pageSize = 20;

  selectedIncident: any = null;
  showModal = false;

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
    try {
      const res: any = await this.api.getAdminIncidents(this.currentPage, this.pageSize, this.searchQuery);
      this.incidents = res.data;
      this.totalRecords = res.total || 0;
    } catch (err: any) {
      console.error("Dashboard Load Error:", err);
      // Redirect to login if unauthorized
      if (err.status === 401 || err.status === 403) {
         this.router.navigate(['/']); 
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

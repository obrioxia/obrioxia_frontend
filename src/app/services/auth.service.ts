import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html'
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
    } finally {
      this.isLoading = false;
    }
  }

  changePage(delta: number) {
    this.page += delta;
    this.loadData();
  }
}

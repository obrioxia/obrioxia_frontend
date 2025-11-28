import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // <--- These were likely missing
import { HealthService } from './services/health.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink,       // <--- Critical for links to work
    RouterLinkActive  // <--- Critical for styling
  ],
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {
  status = 'Checking...';
  statusColor = 'text-gray-500';
  user$ = this.auth.user$;

  constructor(private health: HealthService, public auth: AuthService) {}

  ngOnInit() {
    this.health.checkStatus().subscribe(res => {
      if (res.status === 'operational') {
        this.status = 'ONLINE';
        this.statusColor = 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]';
      } else {
        this.status = 'OFFLINE';
        this.statusColor = 'text-red-500';
      }
    });
  }
}

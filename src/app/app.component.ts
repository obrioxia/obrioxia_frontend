import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HealthService } from './services/health.service';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive
  ],
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {
  status = 'Checking...';
  statusColor = 'text-gray-500';
  user$: Observable<any>; // Declare property first

  constructor(private health: HealthService, public auth: AuthService) {
    // Initialize inside constructor
    this.user$ = this.auth.user$;
  }

  ngOnInit() {
    // Explicitly type 'res' as any to satisfy strict mode
    this.health.checkStatus().subscribe((res: any) => {
      if (res && res.status === 'operational') {
        this.status = 'ONLINE';
        this.statusColor = 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]';
      } else {
        this.status = 'OFFLINE';
        this.statusColor = 'text-red-500';
      }
    });
  }
}

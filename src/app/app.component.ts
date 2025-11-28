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
  user$: Observable<any>; 

  constructor(private health: HealthService, public auth: AuthService) {
    this.user$ = this.auth.user$;
  }

  ngOnInit() {
    // CHANGED: checkStatus -> checkBackendStatus
    this.health.checkBackendStatus().subscribe((isOnline: boolean) => {
      if (isOnline) {
        this.status = 'ONLINE';
        this.statusColor = 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]';
      } else {
        this.status = 'OFFLINE';
        this.statusColor = 'text-red-500';
      }
    });
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HealthService } from './services/health.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'obrioxia-frontend';
  
  // Default to false until proven otherwise
  isSystemOnline = false;
  private healthCheckSub: Subscription | null = null;

  constructor(private healthService: HealthService) {}

  ngOnInit() {
    // 1. Check immediately on load
    this.performCheck();

    // 2. Poll every 10 seconds to keep status live
    this.healthCheckSub = interval(10000)
      .pipe(
        switchMap(() => this.healthService.checkBackendStatus())
      )
      .subscribe((status) => {
        this.isSystemOnline = status;
      });
  }

  performCheck() {
    this.healthService.checkBackendStatus().subscribe(status => {
      this.isSystemOnline = status;
    });
  }

  ngOnDestroy() {
    if (this.healthCheckSub) {
      this.healthCheckSub.unsubscribe();
    }
  }
}


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // ✅ Required for nav functionality

@Component({
  selector: 'app-root',
  standalone: true, // ✅ Confirms this is a standalone component
  // ✅ Explicitly importing the tools needed for routerLink and router-outlet in your HTML
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive
  ], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'obrioxia-frontend';
}

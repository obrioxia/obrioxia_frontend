import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Import HttpClient if you plan to make API calls
import { CommonModule } from '@angular/common'; // Import CommonModule for directives like *ngIf, *ngFor

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule], // Add HttpClientModule here if needed globally, or import HttpClient locally
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'obrioxia-frontend'; // Default title

  // --- Example API Call (Replace with your actual logic) ---
  // backendUrl = 'https://obrioxia-backend-x7mk.onrender.com'; // Your live backend URL
  // data: any;

  // constructor(private http: HttpClient) {} // Inject HttpClient

  // ngOnInit() {
  //   this.fetchData();
  // }

  // fetchData() {
  //   this.http.get<any>(`${this.backendUrl}/api/your-endpoint`) // Replace with your actual endpoint
  //     .subscribe(response => {
  //       console.log('Data fetched:', response);
  //       this.data = response;
  //     }, error => {
  //       console.error('Error fetching data:', error);
  //     });
  // }
  // --- End Example ---
}


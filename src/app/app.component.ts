import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'obrioxia-frontend';

  // Incident data model matching the form inputs
  incidentData = { 
    vehicleID: '', 
    speed: null, 
    gForce: null 
  };
  
  // To store and display server response
  serverResponse: any = null;

  // Inject HttpClient for making API requests
  constructor(private http: HttpClient) {}

  onSubmit() {
    console.log('Submitting incident:', this.incidentData);
    
    // We send the request to '/api/incidents' (plural).
    // Netlify proxy will forward this to your backend URL defined in netlify.toml
    this.http.post<any>('/api/incidents', this.incidentData)
      .subscribe({
        next: (response) => {
          console.log('Server response:', response);
          this.serverResponse = { status: 'Success!', data: response };
        },
        error: (error) => {
          console.error('Error submitting incident:', error);
          // Display a user-friendly error message on the UI
          this.serverResponse = { 
            status: 'Error!', 
            error: error.message || 'An unknown error occurred' 
          };
        }
      });
  }
}




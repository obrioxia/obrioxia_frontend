
// --- NEW IMPORTS ---
import { Component } from '@angular/core';
// Import the new modules we need
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Needed for ngModel
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Needed for API calls
import { RouterOutlet } from '@angular/router'; // Needed if you use routing

@Component({
  selector: 'app-root',
  standalone: true,
  // --- UPDATE IMPORTS ARRAY ---
  // We must add CommonModule, FormsModule, HttpClientModule and RouterOutlet here
  imports: [CommonModule, FormsModule, HttpClientModule, RouterOutlet],
  // --- CORRECT TEMPLATE URL ---
  templateUrl: './app.component.html', // This points to our app.component.html file
  styleUrl: './app.component.css' // Assuming app.component.css exists
})
export class AppComponent {
  // --- NEW LOGIC ---
  title = 'obrioxia-frontend'; // Example property

  // Declare properties needed by the template (matching app.component.ts)
  incidentData = { vehicleID: '', speed: null, gForce: null };
  serverResponse: any = null;
  backendUrl = 'https://obrioxia-backend-x7mk.onrender.com'; // Your live backend URL

  // Inject HttpClient
  constructor(private http: HttpClient) {}

  // Implement the onSubmit method needed by the template (matching app.component.ts)
  onSubmit() {
    console.log('Submitting incident:', this.incidentData);
    this.http.post<any>(`${this.backendUrl}/api/incidents`, this.incidentData) // Replace with your actual endpoint
      .subscribe(response => {
        console.log('Server response:', response);
        this.serverResponse = { status: 'Success!', data: response };
      }, error => {
        console.error('Error submitting incident:', error);
        this.serverResponse = { status: 'Error!', error: error.message };
      });
  }
}



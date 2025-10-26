import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor etc.
import { RouterOutlet } from '@angular/router'; // If using <router-outlet>
import { FormsModule } from '@angular/forms'; // <<<--- NEEDED for ngModel
import { HttpClient, HttpClientModule } from '@angular/common/http'; // <<<--- NEEDED for API calls

@Component({
  selector: 'app-root',
  standalone: true,
  // <<<--- ENSURE ALL MODULES ARE HERE
  imports: [CommonModule, RouterOutlet, FormsModule, HttpClientModule],
  templateUrl: './app.component.html', // Points to the correct HTML file
  styleUrls: ['./app.component.css'] // <<<--- CORRECTED to styleUrls (plural)
})
export class AppComponent {
  title = 'obrioxia-frontend';

  // <<<--- ADDED: Declare properties needed by the template
  incidentData = { vehicleID: '', speed: null, gForce: null };
  serverResponse: any = null;
  backendUrl = 'https://obrioxia-backend-x7mk.onrender.com'; // Your live backend URL

  // Inject HttpClient
  constructor(private http: HttpClient) {}

  // <<<--- ADDED: Implement the onSubmit method needed by the template
  onSubmit() {
    console.log('Submitting incident:', this.incidentData);
    this.http.post<any>(`${this.backendUrl}/api/incidents`, this.incidentData) // Replace with your actual endpoint
      .subscribe({
        next: (response) => {
          console.log('Server response:', response);
          this.serverResponse = { status: 'Success!', data: response };
        },
        error: (error) => {
          console.error('Error submitting incident:', error);
          this.serverResponse = { status: 'Error!', error: error.message };
        }
      });
  }
}


import { Component } from '@angular/core';

// --- NEW IMPORTS ---
// Import the new modules we need
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  // --- UPDATE IMPORTS ARRAY ---
  // We must add CommonModule and FormsModule here
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html', // This points to our app.html file
  styleUrl: './app.css'
})
export class AppComponent {
  // --- NEW LOGIC ---

  // 1. This variable will hold the data from our form fields
  incidentData: any = {
    vehicleID: '',
    speed: null,
    gForce: null
  };

  // 2. This variable will store the response from our server
  serverResponse: string = 'No request sent yet.';

  // 3. This is the backend server's API URL
  backendUrl = 'http://localhost:3000/api/incident';

  // 4. We must "inject" the HttpClient so we can use it to make web requests
  constructor(private http: HttpClient) {}

  // 5. This is the function that runs when we click the "Submit" button
  onSubmit() {
    console.log('Submit button clicked!');
    console.log('Data to send:', this.incidentData);

    // We will add the other required data (timestamp and location) here
    const dataToSend = {
      ...this.incidentData,
      timestamp: new Date().toISOString(), // Use the current time
      location: {
        type: "Point",
        coordinates: [-0.1276, 51.5074] // Using a sample location (London)
      }
    };

    // 6. Use the HttpClient to send a POST request to our backend
    this.http.post(this.backendUrl, dataToSend)
      .subscribe({
        next: (response) => {
          // This runs if the request is successful
          console.log('Server responded successfully:', response);
          this.serverResponse = JSON.stringify(response, null, 2);
        },
        error: (error) => {
          // This runs if the request fails
          console.error('Server returned an error:', error);
          this.serverResponse = `Error: ${error.message}\n\n${JSON.stringify(error.error, null, 2)}`;
        }
      });
  }
}

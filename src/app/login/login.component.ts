import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-[#111] border border-gray-800 p-8 rounded-lg shadow-2xl">
        <h2 class="text-3xl font-bold text-white mb-6 font-orbitron text-center">ADMIN ACCESS</h2>
        
        <form (ngSubmit)="onLogin()" class="space-y-6">
          <div>
            <label class="block text-gray-400 text-sm mb-2 font-mono">EMAIL</label>
            <input 
              [(ngModel)]="email" 
              name="email" 
              type="email" 
              class="w-full bg-black border border-gray-700 text-white p-3 rounded focus:border-cyan-500 focus:outline-none transition-colors" 
              required
            >
          </div>
          
          <div>
            <label class="block text-gray-400 text-sm mb-2 font-mono">PASSWORD</label>
            <input 
              [(ngModel)]="password" 
              name="password" 
              type="password" 
              class="w-full bg-black border border-gray-700 text-white p-3 rounded focus:border-cyan-500 focus:outline-none transition-colors" 
              required
            >
          </div>

          <div *ngIf="errorMessage" class="p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm text-center">
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            [disabled]="isLoading"
            class="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-3 rounded transition-all disabled:opacity-50"
          >
            {{ isLoading ? 'AUTHENTICATING...' : 'LOGIN' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private auth: AuthService) {}

  async onLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.auth.login(this.email, this.password);
    } catch (e: any) {
      this.errorMessage = "Access Denied: Invalid credentials.";
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  }
}

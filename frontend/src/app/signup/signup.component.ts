import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  username: string = '';
  password: string = '';
  errorMessage: string | null = null;
  constructor(private authService: AuthService) {}

  onSignup() {
    this.authService.signup(this.username, this.password).subscribe({
      next: () => {
        this.errorMessage = null;
      },
      error: (error) => {
        this.errorMessage = 'Signup failed. Please check your credentials.';
        console.error(error);
      },
    });
  }
}

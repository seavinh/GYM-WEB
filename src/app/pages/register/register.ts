import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  username = '';
  password = '';
  confirmPassword = '';
  role = 'member';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register({
      username: this.username,
      password: this.password,
      role: this.role
    }).subscribe({
      next: (response) => {
        this.authService.setToken(response.token);
        if (response.user?.role) {
          this.authService.setRole(response.user.role);
        }
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}

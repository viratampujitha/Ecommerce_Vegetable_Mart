import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page fade-in">
      <div class="container">
        <div class="auth-card card">
          <div class="card-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your VeggieMart account</p>
          </div>
          
          <div class="card-body">
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input 
                  type="email" 
                  formControlName="email" 
                  class="form-control"
                  [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  placeholder="Enter your email">
                <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="error-message">
                  <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
                  <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Password</label>
                <input 
                  type="password" 
                  formControlName="password" 
                  class="form-control"
                  [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  placeholder="Enter your password">
                <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error-message">
                  <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
                  <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
                </div>
              </div>

              <div *ngIf="errorMessage" class="alert alert-error">
                {{ errorMessage }}
              </div>

              <div *ngIf="successMessage" class="alert alert-success">
                {{ successMessage }}
              </div>

              <button 
                type="submit" 
                [disabled]="loginForm.invalid || isSubmitting" 
                class="btn btn-primary btn-full">
                {{ isSubmitting ? 'Signing In...' : 'Sign In' }}
              </button>
            </form>
          </div>

          <div class="card-footer">
            <p>Don't have an account? <a routerLink="/register">Create one here</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      text-align: center;
    }

    .card-header h1 {
      font-size: 28px;
      font-weight: bold;
      color: #2d5a3d;
      margin-bottom: 8px;
    }

    .card-header p {
      color: #666;
      margin-bottom: 0;
    }

    .btn-full {
      width: 100%;
    }

    .demo-credentials {
      margin-top: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #28a745;
    }

    .demo-credentials h4 {
      margin: 0 0 12px 0;
      color: #2d5a3d;
      font-size: 16px;
    }

    .demo-credentials p {
      margin: 4px 0;
      font-family: monospace;
      font-size: 14px;
    }

    .demo-credentials small {
      color: #666;
      font-style: italic;
    }

    .card-footer {
      text-align: center;
      background: transparent;
      border-top: 1px solid #e9ecef;
    }

    .card-footer p {
      margin: 0;
      color: #666;
    }

    .card-footer a {
      color: #28a745;
      text-decoration: none;
      font-weight: 500;
    }

    .card-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.successMessage = 'Login successful! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Login failed. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }
}
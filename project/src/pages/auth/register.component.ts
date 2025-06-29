import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page fade-in">
      <div class="container">
        <div class="auth-card card">
          <div class="card-header">
            <h1>Create Account</h1>
            <p>Join VeggieMart and start shopping fresh!</p>
          </div>
          
          <div class="card-body">
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">First Name</label>
                  <input 
                    type="text" 
                    formControlName="firstName" 
                    class="form-control"
                    [class.error]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                    placeholder="Enter your first name">
                  <div *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched" class="error-message">
                    First name is required
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Last Name</label>
                  <input 
                    type="text" 
                    formControlName="lastName" 
                    class="form-control"
                    [class.error]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                    placeholder="Enter your last name">
                  <div *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched" class="error-message">
                    Last name is required
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input 
                  type="email" 
                  formControlName="email" 
                  class="form-control"
                  [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  placeholder="Enter your email">
                <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="error-message">
                  <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
                  <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  formControlName="phone" 
                  class="form-control"
                  placeholder="Enter your phone number">
              </div>

              <div class="form-group">
                <label class="form-label">Password</label>
                <input 
                  type="password" 
                  formControlName="password" 
                  class="form-control"
                  [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  placeholder="Create a password">
                <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="error-message">
                  <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
                  <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  formControlName="confirmPassword" 
                  class="form-control"
                  [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                  placeholder="Confirm your password">
                <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" class="error-message">
                  <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
                  <span *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
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
                [disabled]="registerForm.invalid || isSubmitting" 
                class="btn btn-primary btn-full">
                {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
              </button>
            </form>
          </div>

          <div class="card-footer">
            <p>Already have an account? <a routerLink="/login">Sign in here</a></p>
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
      max-width: 500px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .btn-full {
      width: 100%;
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

    @media (max-width: 480px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { confirmPassword, ...registerData } = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.successMessage = 'Account created successfully! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Registration failed. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }
}
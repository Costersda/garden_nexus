import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'auth-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  // Property to store error messages
  errorMessage: string | null = null;

  // Reactive form definition
  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  // Method called on form submission
  onSubmit(): void {
    this.authService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        if ('error' in response) {
          // Handle custom error from the server
          this.errorMessage = response.error;
        } else {
          // Handle successful login
          console.log('currentUser', response);
          this.authService.setToken(response);
          this.authService.setCurrentUser(response);
          this.errorMessage = null;
          // Navigate to user's profile page
          this.router.navigateByUrl('/profile/' + response.username);
        }
      },
      error: (err: HttpErrorResponse) => {
        // Handle unexpected errors
        console.log('err', err);
        this.errorMessage = 'An unexpected error occurred. Please try again.';
      },
    });
  }
}
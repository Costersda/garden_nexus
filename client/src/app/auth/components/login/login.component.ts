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
  errorMessage: string | null = null;
  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.authService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        if ('error' in response) {
          // This is our custom error
          this.errorMessage = response.error;
        } else {
          // This is a successful login
          console.log('currentUser', response);
          this.authService.setToken(response);
          this.authService.setCurrentUser(response);
          this.errorMessage = null;
          this.router.navigateByUrl('/profile/' + response.username);
        }
      },
      error: (err: HttpErrorResponse) => {
        // This will catch any other unexpected errors
        console.log('err', err);
        this.errorMessage = 'An unexpected error occurred. Please try again.';
      },
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.userService.requestPasswordReset(this.forgotPasswordForm.value.email)
        .subscribe({
          next: (response) => {
            this.successMessage = 'Password reset instructions have been sent to your email.';
            this.errorMessage = '';
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = error.error.message || 'An error occurred. Please try again.';
            this.successMessage = '';
            this.isLoading = false;
          }
        });
    } else {
      this.errorMessage = 'Please enter a valid email address.';
      this.successMessage = '';
    }
  }
}
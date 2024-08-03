import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  private lastEmailSentTime: number = 0;
  private cooldownPeriod: number = 60000; // 60 seconds cooldown

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    // Initialize the form with email field and validators
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      // Check if the cooldown period has passed
      const currentTime = Date.now();
      if (currentTime - this.lastEmailSentTime < this.cooldownPeriod) {
        const remainingTime = Math.ceil((this.cooldownPeriod - (currentTime - this.lastEmailSentTime)) / 1000);
        this.toastr.info(`Please wait ${remainingTime} seconds before requesting another password reset.`);
        return;
      }

      this.isLoading = true;
      // Call the user service to request password reset
      this.userService.requestPasswordReset(this.forgotPasswordForm.value.email)
        .subscribe({
          next: (response) => {
            this.successMessage = 'Password reset instructions have been sent to your email.';
            this.errorMessage = '';
            this.isLoading = false;
            this.lastEmailSentTime = Date.now(); // Update the last email sent time
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
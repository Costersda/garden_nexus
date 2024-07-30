import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private formBuilder: FormBuilder) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      // Here you would typically call a service to handle the password reset
      console.log('Password reset requested for:', this.forgotPasswordForm.value.email);
      this.successMessage = 'Password reset instructions have been sent to your email.';
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Please enter a valid email address.';
      this.successMessage = '';
    }
  }
}
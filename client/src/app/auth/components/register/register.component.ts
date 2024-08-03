import { HttpErrorResponse } from '@angular/common/http';
import { Component, ComponentFactoryResolver, ViewContainerRef, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TermsOfServiceModalComponent } from '../termsOfServiceModal/termsOfServiceModal.component';

@Component({
  selector: 'auth-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  // Array to store error messages
  errorMessages: string[] = [];
  
  // Constants for form validation
  maxUsernameLength = 12;
  minPasswordLength = 8;
  maxPasswordLength = 64;
  
  // Flags for form validation
  usernameAlreadyTaken = false;
  emailAlreadyTaken = false;
  formSubmitted = false;

  // Define the registration form structure
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.maxLength(this.maxUsernameLength)]],
    password: ['', [
      Validators.required, 
      Validators.minLength(this.minPasswordLength), 
      Validators.maxLength(this.maxPasswordLength),
      this.passwordStrengthValidator
    ]],
    confirmPassword: ['', Validators.required],
    agreeToTerms: [false, Validators.requiredTrue]
  }, { validators: this.passwordMatchValidator });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { 'passwordMismatch': true }
      : null;
  }

  // Custom validator to check password strength
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    
    const valid = hasUpperCase && hasNumber;
    
    return valid ? null : { passwordStrength: true };
  }

  // Handle form submission
  onSubmit(): void {
    this.errorMessages = [];
    this.formSubmitted = true;
    this.form.markAllAsTouched();
    if (this.form.valid && !this.usernameAlreadyTaken && !this.emailAlreadyTaken) {
      const { email, username, password } = this.form.getRawValue();
      this.authService.register({ email, username, password }).subscribe({
        next: (currentUser) => {
          this.authService.setToken(currentUser);
          this.authService.setCurrentUser(currentUser);
          this.router.navigateByUrl('/profile/' + currentUser.username);
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err, true);
        },
      });
    } else {
      this.validateForm();
    }
  }

  // Handle username input to enforce max length
  onUsernameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length > this.maxUsernameLength) {
      input.value = input.value.slice(0, this.maxUsernameLength);
      this.form.get('username')?.setValue(input.value);
    }
    this.usernameAlreadyTaken = false;
  }

  // Handle errors from HTTP requests
  private handleError(err: HttpErrorResponse, displayErrors: boolean): void {
    if (displayErrors) {
      if (Array.isArray(err.error)) {
        this.errorMessages = err.error;
      } else if (typeof err.error === 'string') {
        this.errorMessages.push(err.error);
      } else if (err.status === 409) {
        this.errorMessages.push(err.error.message);
      } else {
        this.errorMessages.push('An unexpected error occurred. Please try again.');
      }
    }
  }

  // Validate form and set error messages
  validateForm(): void {
    const passwordControl = this.form.get('password');
    if (passwordControl?.errors?.['required']) {
      this.errorMessages.push('Password is required.');
    } else if (passwordControl?.errors?.['minlength']) {
      this.errorMessages.push(`Password must be at least ${this.minPasswordLength} characters long.`);
    } else if (passwordControl?.errors?.['maxlength']) {
      this.errorMessages.push(`Password must not exceed ${this.maxPasswordLength} characters.`);
    } else if (passwordControl?.errors?.['passwordStrength']) {
      this.errorMessages.push('Password must contain at least one capital letter and one number.');
    }

    if (this.form.errors?.['passwordMismatch']) {
      this.errorMessages.push('Passwords do not match.');
    }

    if (this.form.get('agreeToTerms')?.errors?.['required']) {
      this.errorMessages.push('You must agree to the terms of service.');
    }

    if (this.form.get('username')?.errors?.['maxlength']) {
      this.errorMessages.push(`Username must not exceed ${this.maxUsernameLength} characters.`);
    }

    if (this.usernameAlreadyTaken) {
      this.errorMessages.push('This username is already taken.');
    }

    if (this.emailAlreadyTaken) {
      this.errorMessages.push('This email is already in use.');
    }
  }

  // Open terms of service modal
  openTermsModal(event: Event): void {
    event.preventDefault();
    const factory = this.componentFactoryResolver.resolveComponentFactory(TermsOfServiceModalComponent);
    const componentRef = this.viewContainerRef.createComponent(factory);
    
    componentRef.instance.close.subscribe(() => {
      componentRef.destroy();
    });

    componentRef.instance.agree.subscribe(() => {
      this.form.get('agreeToTerms')?.setValue(true);
      componentRef.destroy();
    });
  }

  // Get the current character count of the username
  getUsernameCharCount(): number {
    return this.form.get('username')?.value?.length || 0;
  }

  // Check if the username is too long
  isUsernameTooLong(): boolean {
    return this.getUsernameCharCount() > this.maxUsernameLength;
  }

  // Get the current character count of the password
  getPasswordCharCount(): number {
    return this.form.get('password')?.value?.length || 0;
  }

  // Check if the password is too long
  isPasswordTooLong(): boolean {
    return this.getPasswordCharCount() > this.maxPasswordLength;
  }

  // Handle password input to enforce max length
  onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length > this.maxPasswordLength) {
      input.value = input.value.slice(0, this.maxPasswordLength);
      this.form.get('password')?.setValue(input.value);
    }
  }
}
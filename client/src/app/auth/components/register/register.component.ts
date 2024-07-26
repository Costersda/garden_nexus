import { HttpErrorResponse } from '@angular/common/http';
import { Component, ComponentFactoryResolver, ViewContainerRef, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TermsOfServiceModalComponent } from '../termsOfServiceModal/termsOfServiceModal.component';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'auth-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  errorMessages: string[] = [];
  maxUsernameLength = 12;
  minPasswordLength = 8;
  maxPasswordLength = 64;
  usernameAlreadyTaken = false;
  emailAlreadyTaken = false;
  formSubmitted = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.maxLength(this.maxUsernameLength)]],
    password: ['', [Validators.required, Validators.minLength(this.minPasswordLength), Validators.maxLength(this.maxPasswordLength)]],
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

  ngOnInit() {
    //maybe not needed
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { 'passwordMismatch': true }
      : null;
  }

  onSubmit(): void {
    this.errorMessages = [];
    this.formSubmitted = true;
    this.form.markAllAsTouched();
    if (this.form.valid && !this.usernameAlreadyTaken && !this.emailAlreadyTaken) {
      const { email, username, password } = this.form.getRawValue();
      this.authService.register({ email, username, password }).subscribe({
        next: (currentUser) => {
          console.log('currentUser', currentUser);
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

  onUsernameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length > this.maxUsernameLength) {
      input.value = input.value.slice(0, this.maxUsernameLength);
      this.form.get('username')?.setValue(input.value);
    }
    this.usernameAlreadyTaken = false;
  }

  private handleError(err: HttpErrorResponse, displayErrors: boolean): void {
    console.log('err', err.error);
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

  validateForm(): void {
    const passwordControl = this.form.get('password');
    if (passwordControl?.errors?.['required']) {
      this.errorMessages.push('Password is required.');
    } else if (passwordControl?.errors?.['minlength']) {
      this.errorMessages.push(`Password must be at least ${this.minPasswordLength} characters long.`);
    } else if (passwordControl?.errors?.['maxlength']) {
      this.errorMessages.push(`Password must not exceed ${this.maxPasswordLength} characters.`);
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

  getUsernameCharCount(): number {
    return this.form.get('username')?.value?.length || 0;
  }

  isUsernameTooLong(): boolean {
    return this.getUsernameCharCount() > this.maxUsernameLength;
  }

  getPasswordCharCount(): number {
    return this.form.get('password')?.value?.length || 0;
  }

  isPasswordTooLong(): boolean {
    return this.getPasswordCharCount() > this.maxPasswordLength;
  }

  onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length > this.maxPasswordLength) {
      input.value = input.value.slice(0, this.maxPasswordLength);
      this.form.get('password')?.setValue(input.value);
    }
  }
}
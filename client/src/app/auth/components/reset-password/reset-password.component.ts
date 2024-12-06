import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    standalone: false
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetForm: FormGroup;
  token: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  minPasswordLength = 8;
  maxPasswordLength = 64;
  isPasswordReset: boolean = false;
  private redirectTimeout: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    // Initialize form with validators
    this.resetForm = this.formBuilder.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(this.minPasswordLength),
        Validators.maxLength(this.maxPasswordLength),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
  }

  ngOnInit(): void {
    // Get token from URL parameters
    this.token = this.route.snapshot.params['token'];
  }

  ngOnDestroy(): void {
    // Clear the timeout if it exists
    if (this.redirectTimeout !== null) {
      clearTimeout(this.redirectTimeout);
    }
  }

  // Custom validator for password strength
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    
    const valid = hasUpperCase && hasNumber;
    
    return valid ? null : { passwordStrength: true };
  }

  // Custom validator to check if passwords match
  checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      this.isLoading = true;
      // Call API to reset password
      this.userService.resetPassword(this.token, this.resetForm.value.password)
        .subscribe({
          next: (response) => {
            this.successMessage = 'Password successfully reset. You can now login with your new password.';
            this.errorMessage = '';
            this.isLoading = false;
            this.isPasswordReset = true;
            // Redirect to login page after 3 seconds
            this.redirectTimeout = window.setTimeout(() => {
              this.router.navigate(['/login'], { replaceUrl: true });
            }, 3000);
          },
          error: (error) => {
            this.errorMessage = error.error.message || 'An error occurred. Please try again.';
            this.successMessage = '';
            this.isLoading = false;
          }
        });
    } else {
      // Handle form validation errors
      if (this.resetForm.hasError('notSame')) {
        this.errorMessage = 'Passwords do not match.';
      } else if (this.resetForm.get('password')?.hasError('minlength')) {
        this.errorMessage = `Password must be at least ${this.minPasswordLength} characters long.`;
      } else if (this.resetForm.get('password')?.hasError('maxlength')) {
        this.errorMessage = `Password cannot be longer than ${this.maxPasswordLength} characters.`;
      } else if (this.resetForm.get('password')?.hasError('passwordStrength')) {
        this.errorMessage = 'Password must contain at least one capital letter and one number.';
      } else {
        this.errorMessage = 'Please enter a valid password and confirm it.';
      }
      this.successMessage = '';
    }
  }
}
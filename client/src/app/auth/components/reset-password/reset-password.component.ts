import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  minPasswordLength = 8;
  maxPasswordLength = 64;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.resetForm = this.formBuilder.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(this.minPasswordLength),
        Validators.maxLength(this.maxPasswordLength)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
  }

  checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.userService.resetPassword(this.token, this.resetForm.value.password)
        .subscribe({
          next: (response) => {
            this.successMessage = 'Password successfully reset. You can now login with your new password.';
            this.errorMessage = '';
            this.isLoading = false;
            setTimeout(() => this.router.navigate(['/login']), 3000);
          },
          error: (error) => {
            this.errorMessage = error.error.message || 'An error occurred. Please try again.';
            this.successMessage = '';
            this.isLoading = false;
          }
        });
    } else {
      if (this.resetForm.hasError('notSame')) {
        this.errorMessage = 'Passwords do not match.';
      } else if (this.resetForm.get('password')?.hasError('minlength')) {
        this.errorMessage = `Password must be at least ${this.minPasswordLength} characters long.`;
      } else if (this.resetForm.get('password')?.hasError('maxlength')) {
        this.errorMessage = `Password cannot be longer than ${this.maxPasswordLength} characters.`;
      } else {
        this.errorMessage = 'Please enter a valid password and confirm it.';
      }
      this.successMessage = '';
    }
  }
}
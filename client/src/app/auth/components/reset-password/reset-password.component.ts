import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  message: string = '';
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
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

  onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.userService.resetPassword(this.token, this.resetForm.value.password)
        .subscribe({
          next: (response) => {
            this.message = 'Password successfully reset. You can now login with your new password.';
            this.isLoading = false;
            setTimeout(() => this.router.navigate(['/login']), 3000);
          },
          error: (error) => {
            this.message = error.error.message || 'An error occurred. Please try again.';
            this.isLoading = false;
          }
        });
    }
  }
}
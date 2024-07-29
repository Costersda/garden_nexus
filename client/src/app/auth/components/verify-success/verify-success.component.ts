// In verify-success.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-success',
  templateUrl: './verify-success.component.html',
})
export class VerifySuccessComponent {

  constructor(private router: Router) {}

  goToBlogs(): void {
    this.router.navigate(['/blogs']);
  }

  goToForum(): void {
    this.router.navigate(['/forum']);
  }
}
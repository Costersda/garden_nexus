import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-verify-success',
    templateUrl: './verify-success.component.html',
    standalone: false
})
export class VerifySuccessComponent {

  constructor(private router: Router) {}

  // Navigate to blogs page
  goToBlogs(): void {
    this.router.navigate(['/blogs']);
  }

  // Navigate to forum page
  goToForum(): void {
    this.router.navigate(['/forum']);
  }
}
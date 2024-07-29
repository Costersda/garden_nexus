// In verify-failed.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CurrentUserInterface } from '../../types/currentUser.interface';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-failed',
  templateUrl: './verify-failed.component.html',
})
export class VerifyFailedComponent implements OnInit, OnDestroy{
  isLoggedInSubscription: Subscription | undefined;
  currentUser: CurrentUserInterface | null | undefined = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedInSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || null; // Ensure null if user is undefined
    });
  }

  ngOnDestroy(): void {
    this.isLoggedInSubscription?.unsubscribe();
  }

  goToProfile(): void {
    if (this.currentUser) {
      this.router.navigate(['/profile', this.currentUser.username], { fragment: 'verification-box' });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
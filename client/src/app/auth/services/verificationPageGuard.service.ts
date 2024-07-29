import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VerificationPageGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map((user) => {
        if (user && user.isVerified) {
          // User is verified, redirect to home page
          this.router.navigate(['/']);
          return false;
        }
        if (user) {
          // User is logged in but not verified, allow access
          return true;
        }
        // User is not logged in, redirect to login page
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
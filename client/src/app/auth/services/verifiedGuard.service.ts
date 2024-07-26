import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VerifiedAuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map((user) => {
        console.log(user);
        if (user && user.isVerified) {
          return true;
        }
        if (user) {
          // User is logged in but not verified
          this.router.navigate(['/profile', user.username], { fragment: 'verification-box' });
        } else {
          // User is not logged in
          this.router.navigateByUrl('/login');
        }
        return false;
      })
    );
  }
}
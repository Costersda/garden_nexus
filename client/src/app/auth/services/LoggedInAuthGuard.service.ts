import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInAuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isLogged$.pipe(
      take(1),
      map((isLoggedIn) => {
        if (isLoggedIn) {
          // User is logged in, redirect to home
          this.router.navigateByUrl('/');
          return false;
        }
        // User is not logged in, allow access
        return true;
      })
    );
  }
}
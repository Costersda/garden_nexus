import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(): Observable<boolean> {
    return this.authService.isLogged$.pipe(
      map((isLoggedIn) => {
        if (isLoggedIn) {
          // User is logged in, allow access
          return true;
        }
        // User is not logged in, redirect to login page
        this.router.navigateByUrl('/login');
        return false;
      })
    );
  }
}
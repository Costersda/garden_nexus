import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Existing authentication logic
    this.authService.getCurrentUser().subscribe({
      next: (currentUser) => {
        this.authService.setCurrentUser(currentUser);
      },
      error: (err) => {
        console.log('err', err);
        this.authService.setCurrentUser(null);
      },
    });

    // New scroll-to-top logic
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }
}
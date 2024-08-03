import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd, Event } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { CurrentUserInterface } from '../../../auth/types/currentUser.interface';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: CurrentUserInterface | null | undefined = null;
  currentUrl: string = '';
  private subscriptions: Subscription[] = [];

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Subscribe to router events to track current URL
    this.subscriptions.push(
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
      })
    );

    // Subscribe to current user updates
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user || null;
      })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Navigate to profile or login page based on user authentication status
  goToProfile(): void {
    if (this.currentUser) {
      const currentUsername = this.route.snapshot.paramMap.get('username');
      if (currentUsername !== this.currentUser.username) {
        this.router.navigate(['/profile', this.currentUser.username]);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Check if the given route is currently active
  isActiveRoute(route: string): boolean {
    if (route === '/') {
      return this.currentUrl === route;
    } else {
      return this.currentUrl.includes(route);
    }
  }
}
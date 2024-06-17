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
  private eventSubscription: Subscription;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    this.eventSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || null;
    });
  }

  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
  }

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

  isActiveRoute(route: string): boolean {
    if (route === '/') {
      return this.currentUrl === route;
    } else {
      return this.currentUrl.includes(route);
    }
  }
}
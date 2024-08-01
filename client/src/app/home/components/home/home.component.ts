import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SlideInterface } from '../../../shared/modules/types/slide.interface';
import { CurrentUserInterface } from '../../../auth/types/currentUser.interface';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedInSubscription: Subscription | undefined;
  currentUser: CurrentUserInterface | null | undefined = null;

  constructor(private authService: AuthService, private router: Router) {}

  // Carousel slide data
  slides: SlideInterface[] = [
    { url: 'assets/homepage-carousel-items/carousal-item-1.webp', title: 'lawn' },
    { url: 'assets/homepage-carousel-items/carousal-item-2.webp', title: 'flowers' },
    { url: 'assets/homepage-carousel-items/carousal-item-3.webp', title: 'outdoor-living' },
    { url: 'assets/homepage-carousel-items/carousal-item-4.webp', title: 'vegetable-garden' },
    { url: 'assets/homepage-carousel-items/carousal-item-5.webp', title: 'roses' },
  ];

  ngOnInit(): void {
    // Subscribe to user authentication state
    this.isLoggedInSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || null;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.isLoggedInSubscription?.unsubscribe();
  }

  // Navigation methods
  goToProfile(): void {
    if (this.currentUser) {
      this.router.navigate(['/profile', this.currentUser.username]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToBlogs(): void {
    this.router.navigate(['/blogs']);
  }

  goToForum(): void {
    this.router.navigate(['/forum']);
  }
}
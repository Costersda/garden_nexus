import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { CurrentUserInterface } from '../../../auth/types/currentUser.interface';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class FooterComponent implements OnInit {
  currentUser: CurrentUserInterface | null | undefined = null;
  currentUrl: string = '';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Subscribe to current user updates
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || null;
    });
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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../types/user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.prod';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule
  ]
})
export class ToolbarComponent implements OnInit, OnDestroy {
  authButtonLabel: string = 'Login';
  currentUser: User | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Update auth button label based on login status
    this.subscriptions.push(
      this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
        this.authButtonLabel = isLoggedIn ? 'Logout' : 'Login';
      })
    );

    // Fetch current user profile if token exists
    const token = localStorage.getItem('token');
    if (token) {
      this.subscriptions.push(
        this.authService.getCurrentUser().pipe(take(1)).subscribe((currentUser) => {
          if (currentUser) {
            this.fetchProfile(currentUser.username);
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Fetch user profile data
  fetchProfile(username: string): void {
    const url = `${environment.apiUrl}/profile/${username}`;
    this.subscriptions.push(
      this.http.get<User>(url).subscribe({
        next: (profile) => {
          this.currentUser = profile;
        },
        error: (error) => {
          console.error('Error fetching profile:', error);
        }
      })
    );
  }

  // Handle login/logout action
  onAuthAction(): void {
    if (this.authButtonLabel === 'Login') {
      this.router.navigate(['/login']);
    } else {
      this.authService.logout();
      this.currentUser = null;
      this.router.navigate(['/']);
    }
  }
}
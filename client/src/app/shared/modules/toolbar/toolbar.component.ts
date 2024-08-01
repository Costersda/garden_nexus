import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../types/user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
export class ToolbarComponent implements OnInit {
  authButtonLabel: string = 'Login';
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Update auth button label based on login status
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      this.authButtonLabel = isLoggedIn ? 'Logout' : 'Login';
    });

    // Fetch current user profile if token exists
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getCurrentUser().subscribe((currentUser) => {
        if (currentUser) {
          this.fetchProfile(currentUser.username);
        }
      });
    }
  }

  // Fetch user profile data
  fetchProfile(username: string): void {
    const url = `${environment.apiUrl}/profile/${username}`;
    this.http.get<User>(url).subscribe({
      next: (profile) => {
        this.currentUser = profile;
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      }
    });
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
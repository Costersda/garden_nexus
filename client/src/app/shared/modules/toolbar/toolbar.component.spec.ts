// src/app/shared/toolbar/toolbar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { CurrentUserInterface } from '../../../auth/types/currentUser.interface';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  authButtonLabel: string = 'Login';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      this.authButtonLabel = isLoggedIn ? 'Logout' : 'Login';
    });

    // Fetch current user if token exists
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getCurrentUser().subscribe((currentUser: CurrentUserInterface) => {
        this.authService.setCurrentUser(currentUser);
      });
    }
  }

  onAuthAction(): void {
    if (this.authButtonLabel === 'Login') {
      this.router.navigate(['/login']);
    } else {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}

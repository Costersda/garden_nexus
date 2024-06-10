import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/services/auth.service';
import { CurrentUserInterface } from '../../auth/types/currentUser.interface';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  //styleUrls: ['./toolbar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule
  ]
})
export class ToolbarComponent {
  authButtonLabel: string = 'Login';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      this.authButtonLabel = isLoggedIn ? 'Logout' : 'Login';
    });

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
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { CurrentUserInterface } from '../../auth/types/currentUser.interface';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class NavbarComponent implements OnInit {
  currentUser: CurrentUserInterface | null | undefined = null;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || null;
    });
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
}

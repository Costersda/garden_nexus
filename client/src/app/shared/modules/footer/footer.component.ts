import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || null;
    });
  }

  goToProfile(): void {
    if (this.currentUser) {
      this.router.navigate(['/profile', this.currentUser.username]);
    } else {
      this.router.navigate(['/login']);
    }
  }
}

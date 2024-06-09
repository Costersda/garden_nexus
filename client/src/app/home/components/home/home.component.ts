import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy{
  isLoggedInSubscription: Subscription | undefined;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedInSubscription = this.authService.isLogged$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigateByUrl('/profile')
      }
    });
  }

  ngOnDestroy(): void {
    this.isLoggedInSubscription?.unsubscribe();
  }
} 
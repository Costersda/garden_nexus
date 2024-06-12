import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SlideInterface } from '../../../shared/imageSlider/types/slide.interface';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy{
  isLoggedInSubscription: Subscription | undefined;
  constructor(private authService: AuthService, private router: Router) {}

  slides: SlideInterface[] = [
    { url: 'assets/homepage-carousel-items/carousal-item-1.webp', title: 'beach' },
    { url: 'assets/homepage-carousel-items/carousal-item-2.webp', title: 'boat' },
    { url: 'assets/homepage-carousel-items/carousal-item-3.webp', title: 'forest' },
    { url: 'assets/homepage-carousel-items/carousal-item-4.webp', title: 'city' },
    { url: 'assets/homepage-carousel-items/carousal-item-5.webp', title: 'italy' },
  ];

  ngOnInit(): void {
    // this.isLoggedInSubscription = this.authService.isLogged$.subscribe(isLoggedIn => {
    //   if (isLoggedIn) {
    //     this.router.navigateByUrl('/profile')
    //   }
    //});
  }

  ngOnDestroy(): void {
    //this.isLoggedInSubscription?.unsubscribe();
  }
} 


// uncomment the following to stop a logged in user from seeing the home page
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-not-found',
  template: `
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist. You'll be redirected to the home page in {{ countdown }} seconds.</p>
  `
})
export class NotFoundComponent implements OnInit {
  // Countdown timer in seconds
  countdown: number = 5;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // Set up interval to countdown and redirect
    const redirectInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(redirectInterval);
        // Redirect to the specified route or home page
        this.router.navigate([this.route.snapshot.data['redirectTo'] || '']);
      }
    }, 1000); // Update every second
  }
}
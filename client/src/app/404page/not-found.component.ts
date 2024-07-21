// src/app/not-found/not-found.component.ts

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
  countdown: number = 5;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const redirectInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(redirectInterval);
        this.router.navigate([this.route.snapshot.data['redirectTo'] || '']);
      }
    }, 1000);
  }
}
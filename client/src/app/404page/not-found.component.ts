import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
    selector: 'app-not-found',
    template: `
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist. You'll be redirected to the home page in {{ countdown }} seconds.</p>
  `,
    standalone: false
})
export class NotFoundComponent implements OnInit, OnDestroy {
  countdown: number = 5;
  private redirectInterval: any;

  constructor(private router: Router, private route: ActivatedRoute, private location: Location) {}

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    this.clearCountdown();
  }

  startCountdown() {
    this.redirectInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        this.clearCountdown();
        const redirectTo = this.route.snapshot.data['redirectTo'] || '';
        this.router.navigateByUrl(redirectTo, { replaceUrl: true }).then(() => {
          this.location.replaceState(redirectTo);
        });
      }
    }, 1000);
  }

  clearCountdown() {
    if (this.redirectInterval) {
      clearInterval(this.redirectInterval);
    }
  }
}

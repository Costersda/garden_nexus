import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
})
export class HelpComponent implements OnInit, OnDestroy {

  constructor() {}

  ngOnInit(): void {
    // Initialization logic here
    console.log('HelpComponent initialized');
  }

  ngOnDestroy(): void {
    // Cleanup logic here
    console.log('HelpComponent destroyed');
  }

  scrollTo(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
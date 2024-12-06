import { Component } from '@angular/core';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    standalone: false
})
export class HelpComponent {

  constructor() {}

  scrollTo(elementId: string): void {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}
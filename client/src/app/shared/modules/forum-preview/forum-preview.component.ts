import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';


@Component({
  selector: 'app-forum-preview',
  templateUrl: './forum-preview.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ForumPreviewComponent {
  
  constructor(private router: Router) {}

  
}

// src/app/shared/modules/blog-preview/blog-preview.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Blog } from '../../../shared/types/blog.interface';

@Component({
  selector: 'app-blog-preview',
  templateUrl: './blog-preview.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BlogPreviewComponent {
  @Input() blog!: Blog;

  constructor(private router: Router) {}

  get previewContent(): string {
    return this.blog.content_section_1.split(' ').slice(0, 150).join(' ') + '...';
  }

  viewBlog(id: string): void {
    this.router.navigate(['/blog', id]);
  }
}

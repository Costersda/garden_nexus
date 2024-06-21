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
  @Input() source: string = 'blog';
  @Input() username?: string;

  constructor(private router: Router) {}

  get previewContent(): string {
    return this.blog.content_section_1.split(' ').slice(0, 150).join(' ') + '...';
  }

  viewBlog(id: string): void {
    const queryParams: any = this.source === 'profile' && this.username ? { source: 'profile', username: this.username } : { source: 'blog' };
    this.router.navigate(['/blog', id], { queryParams });
  }
}

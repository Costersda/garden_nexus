import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Blog } from '../../../shared/types/blog.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-blog-preview',
  templateUrl: './blog-preview.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class BlogPreviewComponent {
  @Input() blog!: Blog;
  @Input() source: string = 'blog';
  @Input() username?: string;
  blogAuthor: string = '';

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    if (this.blog.user_id) {
      this.userService.getUserById(this.blog.user_id).subscribe(user => {
        this.blogAuthor = user.username;
      });
    }
  }

  get previewContent(): string {
    return this.blog.content_section_1.split(' ').slice(0, 15).join(' ') + '...';
  }

  viewBlog(id: string): void {
    const queryParams: any = this.source === 'profile' && this.username ? { source: 'profile', username: this.username } : { source: 'blog' };
    this.router.navigate(['/blog', id], { queryParams });
  }
}

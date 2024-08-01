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
  // Input properties
  @Input() blog!: Blog;
  @Input() source: string = 'blog';
  @Input() username?: string;
  
  // Property to store the blog author's username
  blogAuthor: string = '';

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    // Fetch the blog author's username when the component initializes
    if (this.blog.user_id) {
      this.userService.getUserById(this.blog.user_id).subscribe(user => {
        this.blogAuthor = user.username;
      });
    }
  }

  // Getter to create a preview of the blog content
  get previewContent(): string {
    return this.blog.content_section_1.split(' ').slice(0, 15).join(' ') + '...';
  }

  // Method to navigate to the full blog view
  viewBlog(id: string): void {
    // Set query parameters based on the source of the preview
    const queryParams: any = this.source === 'profile' && this.username 
      ? { source: 'profile', username: this.username } 
      : { source: 'blog' };
    
    // Navigate to the blog page with the appropriate query parameters
    this.router.navigate(['/blog', id], { queryParams });
  }
}
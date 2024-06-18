import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../../shared/services/blog.service';
import { Blog } from '../../../shared/types/blog.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { Category, CATEGORIES } from '../../../shared/types/category.interface';

@Component({
  selector: 'app-create-blog',
  templateUrl: './createBlog.component.html',
})
export class CreateBlogComponent implements OnInit {
  blog: Blog;
  categories: Category[] = CATEGORIES;

  constructor(
    private blogService: BlogService,
    private router: Router,
    private authService: AuthService
  ) {
    this.blog = this.initializeBlog();
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(currentUser => {
      if (currentUser && currentUser.id) {
        this.blog.user_id = currentUser.id;
      }
    }, error => {
      console.error('Error fetching current user:', error);
    });
  }

  initializeBlog(): Blog {
    return {
      user_id: '',
      title: '',
      content_section_1: '',
      content_section_2: '',
      content_section_3: '',
      image_1: '',
      image_2: '',
      image_3: '',
      categories: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  onFileChange(event: any, imageField: 'image_1' | 'image_2' | 'image_3'): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.blog[imageField] = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  toggleCategory(category: string): void {
    const index = this.blog.categories.indexOf(category);
    if (index === -1) {
      this.blog.categories.push(category);
    } else {
      this.blog.categories.splice(index, 1);
    }
  }

  createBlog(): void {
    this.blogService.createBlog(this.blog).subscribe(() => {
      this.router.navigate(['/blogs']);
    }, error => {
      console.error('Error creating blog:', error);
    });
  }
}

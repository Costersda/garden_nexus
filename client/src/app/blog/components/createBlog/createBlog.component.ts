import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../../shared/services/blog.service';
import { Blog } from '../../../shared/types/blog.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { Category, CATEGORIES } from '../../../shared/types/category.interface';

@Component({
  selector: 'app-create-blog',
  templateUrl: './createBlog.component.html',
})
export class CreateBlogComponent implements OnInit, AfterViewInit {
  blog: Blog;
  categories: Category[] = CATEGORIES;
  fileSizeError: { [key: string]: string | null } = {};
  fileTypeError: { [key: string]: string | null } = {};
  formSubmitted = false;
  imageErrors: { [key: string]: boolean } = {};
  maxTitleLength = 100; // Example maximum length for title
  maxContentLength = 1000;
  minContentLength = 200;

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

  ngAfterViewInit(): void {
    this.addAutoGrow();
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
    if (file.size > 2 * 1024 * 1024) { // 2 MB file size limit
      this.fileSizeError[imageField] = 'File size exceeds 2 MB';
      this.fileTypeError[imageField] = null;
      this.imageErrors[imageField] = true;
      return;
    }
    const validFileTypes = ['image/jpeg', 'image/png'];
    if (!validFileTypes.includes(file.type)) {
      this.fileTypeError[imageField] = 'Invalid file type. Only JPEG and PNG are allowed';
      this.fileSizeError[imageField] = null;
      this.imageErrors[imageField] = true;
      return;
    }
    this.fileSizeError[imageField] = null;
    this.fileTypeError[imageField] = null;
    this.imageErrors[imageField] = false;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.blog[imageField] = e.target.result;
      this.formSubmitted = false; // Clear form submission status to remove errors
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
    this.formSubmitted = true;

    if (!this.blog.title || !this.blog.content_section_1 || !this.blog.image_1 || this.blog.content_section_1.length < this.minContentLength) {
      return; // Prevent form submission if required fields are missing or content_section_1 is too short
    }

    this.blogService.createBlog(this.blog).subscribe(() => {
      this.router.navigate(['/blogs']);
    }, error => {
      console.error('Error creating blog:', error);
    });
  }

  getTitleWordCount(): number {
    return this.blog.title.trim().split(/\s+/).length;
  }

  getContentWordCount(section: 'content_section_1' | 'content_section_2' | 'content_section_3'): number {
    const content = this.blog[section];
    return content ? content.trim().split(/\s+/).length : 0;
  }

  addAutoGrow(): void {
    const textareas = document.querySelectorAll('.auto-grow') as NodeListOf<HTMLTextAreaElement>;
    textareas.forEach(textarea => {
      textarea.addEventListener('input', this.autoGrow.bind(textarea), false);
    });
  }

  autoGrow(this: HTMLTextAreaElement): void {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  }

  hasImageErrors(): boolean {
    return Object.values(this.imageErrors).some(error => error);
  }
}

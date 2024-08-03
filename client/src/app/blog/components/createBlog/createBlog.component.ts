import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../../shared/services/blog.service';
import { Blog } from '../../../shared/types/blog.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { Category, CATEGORIES } from '../../../shared/types/category.interface';
import { Subscription } from 'rxjs';

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
  maxTitleLength = 100;
  maxContentWords = 1000;
  minContentWords = 200;
  maxWordLength = 50;
  private subscriptions: Subscription[] = [];

  constructor(
    private blogService: BlogService,
    private router: Router,
    private authService: AuthService
  ) {
    this.blog = this.initializeBlog();
  }

  ngOnInit(): void {
    // Set user_id for the blog
    const userSubscription = this.authService.getCurrentUser().subscribe(
      currentUser => {
        if (currentUser && currentUser.id) {
          this.blog.user_id = currentUser.id;
        }
      },
      error => {
        console.error('Error fetching current user:', error);
      }
    );
    this.subscriptions.push(userSubscription);
  }

  ngAfterViewInit(): void {
    this.addAutoGrow();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Initialize a new blog object
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

  // Handle file upload and validation
  onFileChange(event: any, imageField: 'image_1' | 'image_2' | 'image_3'): void {
    const file = event.target.files[0];
    if (file.size > 2 * 1024 * 1024) { // 2 MB limit
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
      this.formSubmitted = false;
    };
    reader.readAsDataURL(file);
  }

  // Toggle category selection
  toggleCategory(category: string): void {
    const index = this.blog.categories.indexOf(category);
    if (index === -1) {
      this.blog.categories.push(category);
    } else {
      this.blog.categories.splice(index, 1);
    }
  }

  // Create and submit the blog post
  createBlog(): void {
    this.formSubmitted = true;

    // Validate form before submission
    if (!this.blog.title || !this.blog.content_section_1 || !this.blog.image_1 || 
        this.getContentWordCount('content_section_1') < this.minContentWords ||
        this.blog.title.length > this.maxTitleLength ||
        !this.isContentValid('content_section_1') ||
        !this.isContentValid('content_section_2') ||
        !this.isContentValid('content_section_3')) {
      return;
    }

    const createBlogSubscription = this.blogService.createBlog(this.blog).subscribe(
      () => {
        this.router.navigate(['/blogs'], { replaceUrl: true });
      },
      error => {
        console.error('Error creating blog:', error);
      }
    );
    this.subscriptions.push(createBlogSubscription);
  }

  getTitleCharCount(): number {
    return this.blog.title.length;
  }

  getContentWordCount(section: 'content_section_1' | 'content_section_2' | 'content_section_3'): number {
    const content = this.blog[section];
    return content ? this.countWords(content) : 0;
  }
  
  // Count words, filtering out invalid ones
  countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0 && word.length <= this.maxWordLength)
      .length;
  }

  isTitleTooLong(): boolean {
    return this.getTitleCharCount() > this.maxTitleLength;
  }

  isContentTooLong(section: 'content_section_1' | 'content_section_2' | 'content_section_3'): boolean {
    return this.getContentWordCount(section) > this.maxContentWords;
  }
  
  isContentTooShort(section: 'content_section_1' | 'content_section_2' | 'content_section_3'): boolean {
    const wordCount = this.getContentWordCount(section);
    return wordCount > 0 && wordCount < this.minContentWords;
  }

  // Validate content for word length
  isContentValid(section: 'content_section_1' | 'content_section_2' | 'content_section_3'): boolean {
    const content = this.blog[section];
    if (!content) return true; // Optional sections are valid if empty

    const words = content.trim().split(/\s+/);
    const validWords = words.filter(word => word.length > 0 && word.length <= this.maxWordLength);
    
    return words.length === validWords.length;
  }

  // Add auto-grow functionality to textareas
  addAutoGrow(): void {
    const textareas = document.querySelectorAll('.auto-grow') as NodeListOf<HTMLTextAreaElement>;
    textareas.forEach(textarea => {
      textarea.addEventListener('input', this.autoGrow.bind(textarea), false);
    });
  }

  // Auto-grow textarea based on content
  autoGrow(this: HTMLTextAreaElement): void {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  }

  // Check for any errors in the form
  hasErrors(): boolean {
    return Object.values(this.imageErrors).some(error => error) ||
           !this.isContentValid('content_section_1') ||
           !this.isContentValid('content_section_2') ||
           !this.isContentValid('content_section_3');
  }
}
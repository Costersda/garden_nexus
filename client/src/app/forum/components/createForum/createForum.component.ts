import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ForumService } from '../../../shared/services/forum.service';
import { Forum } from '../../../shared/types/forum.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { Category, CATEGORIES } from '../../../shared/types/category.interface';

@Component({
  selector: 'app-create-forum',
  templateUrl: './createForum.component.html',
})
export class CreateForumComponent implements OnInit, AfterViewInit {
  forum: Forum;
  categories: Category[] = CATEGORIES;
  formSubmitted = false;
  maxTitleLength = 100; // Example maximum length for title
  maxContentLength = 1000;
  minContentLength = 200;

  constructor(
    private forumService: ForumService,
    private router: Router,
    private authService: AuthService
  ) {
    this.forum = this.initializeForum();
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(currentUser => {
      if (currentUser && currentUser.id) {
        this.forum.user_id = currentUser.id;
      }
    }, error => {
      console.error('Error fetching current user:', error);
    });
  }

  ngAfterViewInit(): void {
    this.addAutoGrow();
  }

  initializeForum(): Forum {
    return {
      user_id: '',
      title: '',
      content: '',
      categories: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  toggleCategory(category: string): void {
    const index = this.forum.categories.indexOf(category);
    if (index === -1) {
      this.forum.categories.push(category);
    } else {
      this.forum.categories.splice(index, 1);
    }
  }

  createForum(): void {
    this.formSubmitted = true;

    if (!this.forum.title || !this.forum.content || this.forum.content.length < this.minContentLength) {
      return; // Prevent form submission if required fields are missing or content is too short
    }

    this.forumService.createForum(this.forum).subscribe(() => {
      this.router.navigate(['/forum']);
    }, error => {
      console.error('Error creating forum:', error);
    });
  }

  getTitleWordCount(): number {
    return this.forum.title.trim().split(/\s+/).length;
  }

  getContentWordCount(): number {
    return this.forum.content ? this.forum.content.trim().split(/\s+/).length : 0;
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
}

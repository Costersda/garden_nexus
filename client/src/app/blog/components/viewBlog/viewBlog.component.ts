import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogService } from '../../../shared/services/blog.service';
import { Blog } from '../../../shared/types/blog.interface';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/types/user.interface';
import { CommentService } from '../../../shared/services/comment.service';
import { Comment } from '../../../shared/types/comment.interface';
import { ConfirmationDialogService } from '../../../shared/modules/confirmation-dialog/confirmation-dialog.service';
import { Category, CATEGORIES } from '../../../shared/types/category.interface';

@Component({
  selector: 'app-view-blog',
  templateUrl: './viewBlog.component.html',
})
export class ViewBlogComponent implements OnInit, OnDestroy {
  // Main data objects
  blog: Blog | null = null;
  user: User | null = null;
  currentUser: User | null = null;
  originalBlog: Blog | null = null;

  // Arrays
  comments: Comment[] = [];
  categories: Category[] = CATEGORIES;
  imageUrls: string[] = [];

  // Subscriptions
  private routeSubscription!: Subscription;
  private blogSubscription!: Subscription;
  private userSubscription!: Subscription;
  private commentSubscription!: Subscription;

  // Comment-related
  newComment: string = '';
  commentBeingEdited: Comment | null = null;
  editCommentText: string = '';
  replyingToComment: Comment | null = null;
  replyText: string = '';

  // String properties
  source: string | null = null;
  username: string | null = null;
  titleError: string | null = null;

  // Boolean flags
  isNewCommentTooLong: boolean = false;
  isEditCommentTooLong: boolean = false;
  showBlogDropdown: boolean = false;
  isEditMode: boolean = false;
  formSubmitted: boolean = false;

  // Numeric constants
  maxCommentLength: number = 600;
  maxTitleLength: number = 100;
  minContentWords: number = 200;
  maxContentWords: number = 1000;
  maxWordLength: number = 50;

  // Objects
  private imageUrlCache: { [key: string]: string } = {};
  fileSizeError: { [key: string]: string } = {};
  fileTypeError: { [key: string]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private userService: UserService,
    private commentService: CommentService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit(): void {
    // Subscribe to route params and query params
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const blogId = params.get('id');
      this.route.queryParams.subscribe(queryParams => {
        this.source = queryParams['source'] || null;
        this.username = queryParams['username'] || null;
      });
      if (blogId) {
        this.fetchCurrentUser();
        this.fetchBlog(blogId);
      }
    });

    // Set up MutationObserver for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.addAutoGrow();
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    [this.routeSubscription, this.blogSubscription, this.userSubscription, this.commentSubscription].forEach(sub => sub?.unsubscribe());

    // Clean up image URLs
    this.imageUrls.forEach(url => URL.revokeObjectURL(url));

    // Clean up image URL cache
    for (const key in this.imageUrlCache) {
      if (this.imageUrlCache[key].startsWith('blob:')) {
        URL.revokeObjectURL(this.imageUrlCache[key]);
      }
    }
    this.imageUrlCache = {};
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    // Close all dropdowns on outside click
    this.comments = this.comments.map(c => ({ ...c, showDropdown: false }));
    this.showBlogDropdown = false;
  }

  toggleDropdown(comment: Comment, event: MouseEvent): void {
    event.stopPropagation();
    // Toggle dropdown for specific comment
    this.comments = this.comments.map(c => ({
      ...c,
      showDropdown: c._id === comment._id ? !c.showDropdown : false
    }));
  }

  toggleBlogDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showBlogDropdown = !this.showBlogDropdown;
  }

  fetchCurrentUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      // Ensure _id is set
      if (this.currentUser && !this.currentUser._id) {
        this.currentUser._id = (this.currentUser as any).id || this.currentUser._id;
      }
    } else {
      console.error('Current user not found in local storage');
    }
  }

  fetchBlog(blogId: string): void {
    this.blogSubscription = this.blogService.getBlogById(blogId).subscribe(
      (blog: Blog | null) => {
        if (blog) {
          this.blog = blog;
          this.originalBlog = JSON.parse(JSON.stringify(blog));
          if (blog.user_id) {
            this.fetchUser(blog.user_id);
          }
          this.fetchComments(blogId);
        } else {
          // Blog not found, redirect to blogs list
          this.router.navigate(['/blogs']);
        }
      },
      (error) => {
        console.error('Error fetching blog:', error);
        this.router.navigate(['/blogs']);
      }
    );
  }

  async deleteBlog(blogId: string): Promise<void> {
    if (!blogId) {
      console.error('Blog ID is undefined');
      return;
    }

    // Confirm deletion with user
    const confirmed = await this.confirmationDialogService.confirm(
      'Confirm Deletion',
      'Are you sure you want to delete this blog?'
    );

    if (confirmed) {
      this.blogService.deleteBlog(blogId).subscribe(
        () => {
          // Replace current history entry and navigate
          history.replaceState(null, '', '/blogs');
          this.router.navigate(['/blogs']);
        },
        (error) => {
          console.error('Error deleting blog:', error);
        }
      );
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.saveBlogChanges();
    }
  }

  saveBlogChanges(): void {
    this.formSubmitted = true;
    this.titleError = null;

    if (!this.blog || !this.blog._id) return;

    // Validate title
    if (!this.blog.title || this.blog.title.trim().length === 0) {
      this.titleError = 'Title is required';
      return;
    }

    if (this.blog.title.length > this.maxTitleLength) {
      this.titleError = 'Title exceeds maximum length';
      return;
    }

    // Validate image
    if (!this.blog.image_1) {
      this.fileSizeError['image_1'] = 'Image 1 is required';
      return;
    }

    if (this.hasFormErrors()) return;

    // Mark the blog as edited and update
    this.blog.isEdited = true;

    this.blogService.updateBlog(this.blog._id, this.blog).subscribe(
      (updatedBlog: Blog) => {
        this.blog = updatedBlog;
        this.originalBlog = JSON.parse(JSON.stringify(updatedBlog));
        this.isEditMode = false;
        this.formSubmitted = false;
        this.titleError = null;
      },
      (error) => {
        console.error('Error updating blog:', error);
        this.formSubmitted = false;
      }
    );
  }

  public get isFormValid(): boolean {
    return !this.hasFormErrors();
  }

  checkTitleValidity(): void {
    if (this.blog) {
      if (!this.blog.title || this.blog.title.trim().length === 0) {
        this.titleError = 'Title is required';
      } else if (this.blog.title.length > this.maxTitleLength) {
        this.titleError = 'Title exceeds maximum length';
      } else {
        this.titleError = null;
      }
    }
  }

  cancelEdit(): void {
    // Revert changes and exit edit mode
    this.blog = JSON.parse(JSON.stringify(this.originalBlog));
    this.isEditMode = false;
    this.titleError = null;
  }

  deleteImage(section: number): void {
    if (this.blog) {
      (this.blog as any)[`image_${section}`] = '';
    }
  }

  onFileChange(event: any, fieldName: string): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size and type
      if (file.size > 2 * 1024 * 1024) {
        this.fileSizeError[fieldName] = 'File size exceeds 2 MB';
        this.fileTypeError[fieldName] = '';
      } else if (!file.type.startsWith('image/')) {
        this.fileTypeError[fieldName] = 'Invalid file type';
        this.fileSizeError[fieldName] = '';
      } else {
        // Clear errors and read file
        this.fileSizeError[fieldName] = '';
        this.fileTypeError[fieldName] = '';
        const reader = new FileReader();
        reader.onload = () => {
          if (this.blog) {
            (this.blog as any)[fieldName] = reader.result as string;
          }
        };
        reader.readAsDataURL(file);
      }
    } else if (fieldName === 'image_1') {
      // No new image selected for image_1, keep existing image
    }
  }

  fetchUser(userId: string): void {
    this.userSubscription = this.userService.getUserById(userId).subscribe(
      (user: User) => {
        this.user = user;
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
  }

  fetchComments(blogId: string): void {
    this.commentSubscription = this.commentService.getCommentsByBlogId(blogId).subscribe(
      (comments: Comment[]) => {
        // Normalize comment and user IDs
        this.comments = comments.map(comment => {
          const user = comment.user as User;
          const userId = user._id ? user._id.toString() : (user.id ? user.id.toString() : '');
          const commentId = comment._id ? comment._id.toString() : (comment.id ? comment.id.toString() : '');
          return {
            ...comment,
            _id: commentId,
            user: {
              ...user,
              _id: userId
            }
          };
        });
        console.log('Comments:', this.comments);
        this.cd.detectChanges();
      },
      (error) => {
        console.error('Error fetching comments:', error);
      }
    );
  }

  checkCommentLength(type: string): void {
    // Check if comment length exceeds maximum allowed length
    if (type === 'new') {
      this.isNewCommentTooLong = this.newComment.length > this.maxCommentLength;
    } else if (type === 'edit') {
      this.isEditCommentTooLong = this.editCommentText.length > this.maxCommentLength;
    }
  }

  addComment(): void {
    if (!this.newComment.trim() || this.isNewCommentTooLong) return;

    if (this.currentUser && this.currentUser._id) {
      // Prepare comment data
      const commentData: Comment = {
        user: {
          _id: this.currentUser._id,
          username: this.currentUser.username,
          imageFile: this.currentUser.imageFile || 'assets/garden-nexus-logo.webp'
        },
        blogId: this.blog?._id || '',
        comment: this.newComment,
        createdAt: new Date(),
        replyingTo: this.replyingToComment ? {
          id: this.replyingToComment._id || '',
          user: {
            _id: this.replyingToComment.user?._id || '',
            username: this.replyingToComment.user?.username || ''
          },
          comment: this.replyingToComment.comment
        } : undefined,
        replyText: this.replyingToComment ? this.replyText : ''
      };

      // Create comment
      this.commentService.createComment(commentData).subscribe(
        (comment: Comment) => {
          // Normalize new comment object
          const newComment: Comment = {
            ...comment,
            _id: comment._id || comment.id,
            user: {
              _id: comment.user._id || (comment.user as any).id,
              username: comment.user.username,
              imageFile: comment.user.imageFile
            },
            replyingTo: this.replyingToComment ? {
              id: this.replyingToComment._id || '',
              user: {
                _id: this.replyingToComment.user?._id || '',
                username: this.replyingToComment.user?.username || ''
              },
              comment: this.replyingToComment.comment
            } : undefined,
            replyText: this.replyingToComment ? this.replyText : ''
          };

          // Add new comment and reset form
          this.comments = [...this.comments, newComment];
          this.newComment = '';
          this.isNewCommentTooLong = false;
          this.replyingToComment = null;
          this.replyText = '';
          console.log('Added Comment:', newComment);
          this.cd.detectChanges();
        },
        (error) => {
          console.error('Error adding comment:', error);
        }
      );
    } else {
      console.error('Current user not found in local storage');
    }
  }

  async deleteComment(commentId: string | undefined): Promise<void> {
    console.log('Attempting to delete comment with ID:', commentId);

    if (!commentId) {
      console.error('Comment ID is undefined');
      return;
    }

    // Confirm deletion with user
    const confirmed = await this.confirmationDialogService.confirm(
      'Confirm Deletion',
      'Are you sure you want to delete this comment?'
    );

    if (confirmed) {
      this.commentService.deleteCommentById(commentId).subscribe(
        () => {
          console.log('Successfully deleted comment with ID:', commentId);
          // Remove deleted comment from list
          this.comments = this.comments.filter(comment => {
            const currentCommentId = comment._id ? comment._id.toString() : (comment.id ? comment.id.toString() : '');
            return currentCommentId !== commentId;
          });
          this.cd.detectChanges();
        },
        (error) => {
          console.error('Error deleting comment:', error);
        }
      );
    }
  }

  editComment(comment: Comment): void {
    // Set up comment for editing
    this.commentBeingEdited = comment;
    this.editCommentText = comment.comment;
    this.isEditCommentTooLong = false;
    // Focus on textarea after a short delay
    setTimeout(() => {
      const textarea = document.querySelector('.edit-comment-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    });
  }

  cancelEditComment(): void {
    // Reset edit state
    this.commentBeingEdited = null;
    this.editCommentText = '';
    this.isEditCommentTooLong = false;
  }

  saveEditedComment(): void {
    if (!this.editCommentText.trim() || !this.commentBeingEdited || this.isEditCommentTooLong) return;

    const updatedComment = {
      ...this.commentBeingEdited,
      comment: this.editCommentText,
      isEdited: true
    };

    // Update comment in local array
    this.comments = this.comments.map(c =>
      c._id === updatedComment._id ? { ...updatedComment, comment: `${updatedComment.comment} ` } : c
    );
    this.commentBeingEdited = null;
    this.editCommentText = '';
    this.cd.detectChanges();

    // Update comment on server
    this.commentService.updateCommentById(updatedComment._id!, updatedComment).subscribe(
      (comment: Comment) => {
        console.log('Updated comment:', comment);
      },
      (error) => {
        console.error('Error editing comment:', error);
        this.fetchComments(this.blog!._id!);
      }
    );
  }

  goBack(): void {
    // Navigate back based on source
    if (this.source === 'profile' && this.username) {
      this.router.navigate(['/profile', this.username]);
    } else {
      this.router.navigate(['/blogs']);
    }
  }

  getImageUrl(imageFile: any): string {
    if (!imageFile) {
      return 'assets/garden-nexus-logo.webp';
    }

    // Check cache first
    const cacheKey = JSON.stringify(imageFile);
    if (this.imageUrlCache[cacheKey]) {
      return this.imageUrlCache[cacheKey];
    }

    let url: string;
    if (imageFile && imageFile.type === 'Buffer' && Array.isArray(imageFile.data)) {
      // Convert Buffer to Blob and create URL
      const uint8Array = new Uint8Array(imageFile.data);
      const blob = new Blob([uint8Array], { type: 'image/jpeg' });
      url = URL.createObjectURL(blob);
      this.imageUrls.push(url);
    } else if (typeof imageFile === 'string') {
      url = imageFile;
    } else {
      url = 'assets/garden-nexus-logo.webp';
    }

    // Cache the URL
    this.imageUrlCache[cacheKey] = url;
    return url;
  }

  private hasFormErrors(): boolean {
    if (!this.blog) {
      console.log('Blog is null');
      return true;
    }
    // Check various form validations
    const titleValid = this.blog?.title?.length <= this.maxTitleLength;
    const contentSection1Valid = this.isContentValid('content_section_1');
    const contentSection2Valid = this.isContentValid('content_section_2');
    const contentSection3Valid = this.isContentValid('content_section_3');
    const image1Valid = !!this.blog?.image_1 && !this.fileSizeError['image_1'] && !this.fileTypeError['image_1'];
  
    return !titleValid || !contentSection1Valid || !image1Valid || this.hasImageErrors();
  }

  isContentValid(section: 'content_section_1' | 'content_section_2' | 'content_section_3'): boolean {
    const content = this.blog![section];
    if (!content) return true; // Optional sections are always valid if empty

    const wordCount = this.getContentWordCount(content);
    return wordCount >= this.minContentWords && wordCount <= this.maxContentWords && this.areAllWordsValid(content);
  }

  getContentWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  areAllWordsValid(content: string): boolean {
    const words = content.trim().split(/\s+/);
    return words.every(word => word.length <= this.maxWordLength);
  }

  isContentTooShort(section: 'content_section_1' | 'content_section_2' | 'content_section_3'): boolean {
    const content = this.blog![section];
    if (!content) return false; // Optional sections are not considered too short if empty
    const wordCount = this.getContentWordCount(content);
    return wordCount > 0 && wordCount < this.minContentWords;
  }

  isContentTooLong(section: 'content_section_1' | 'content_section_2' | 'content_section_3'): boolean {
    const content = this.blog![section];
    if (!content) return false;
    return this.getContentWordCount(content) > this.maxContentWords;
  }

  hasImageErrors(): boolean {
    return Object.values(this.fileSizeError).some(error => !!error) || Object.values(this.fileTypeError).some(error => !!error);
  }

  addAutoGrow(): void {
    // Add auto-grow functionality to textareas
    const textareas = document.querySelectorAll('.auto-grow') as NodeListOf<HTMLTextAreaElement>;
    textareas.forEach(textarea => {
      this.autoGrow.call(textarea);
      textarea.addEventListener('input', this.autoGrow.bind(textarea), false);
    });
    this.cd.detectChanges();
  }

  autoGrow(this: HTMLTextAreaElement): void {
    // Adjust textarea height based on content
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  }

  toggleCategory(category: string): void {
    if (!this.blog || !this.blog.categories) return;
    const index = this.blog.categories.indexOf(category);
    if (index === -1) {
        this.blog.categories.push(category);
    } else {
        this.blog.categories.splice(index, 1);
    }
}

  quoteComment(comment: Comment) {
    // Set up reply to comment
    this.replyingToComment = comment;
    this.replyText = `"${comment.comment}"`;
    // Scroll to the comment input area
    const commentInput = document.querySelector('.add-comment-section textarea');
    if (commentInput) {
      (commentInput as HTMLElement).focus();
      commentInput.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cancelReply() {
    // Cancel reply to comment
    this.replyingToComment = null;
    this.replyText = '';
  }

  public isUrlCached(imageFile: any): boolean {
    const cacheKey = JSON.stringify(imageFile);
    return !!this.imageUrlCache[cacheKey];
  }
}
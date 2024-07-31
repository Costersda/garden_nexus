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
  blog: Blog | null = null;
  user: User | null = null;
  comments: Comment[] = [];
  newComment: string = '';
  source: string | null = null;
  username: string | null = null;
  private routeSubscription!: Subscription;
  private blogSubscription!: Subscription;
  private userSubscription!: Subscription;
  private commentSubscription!: Subscription;
  public currentUser: User | null = null;
  commentBeingEdited: Comment | null = null;
  editCommentText: string = '';
  isNewCommentTooLong: boolean = false;
  isEditCommentTooLong: boolean = false;
  maxCommentLength: number = 600;
  private imageUrls: string[] = [];
  private imageUrlCache: { [key: string]: string } = {};
  showBlogDropdown: boolean = false;
  isEditMode: boolean = false;
  originalBlog: Blog | null = null;
  fileSizeError: { [key: string]: string } = {};
  fileTypeError: { [key: string]: string } = {};
  formSubmitted: boolean = false;
  maxTitleLength: number = 100; // This remains as character count
  minContentWords: number = 200;
  maxContentWords: number = 1000;
  maxWordLength: number = 50; // Maximum allowed length for a single word
  categories: Category[] = CATEGORIES;
  titleError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private userService: UserService,
    private commentService: CommentService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  ngOnInit(): void {
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
  
    // Add the MutationObserver here
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
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.blogSubscription) {
      this.blogSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.commentSubscription) {
      this.commentSubscription.unsubscribe();
    }
    this.imageUrls.forEach(url => URL.revokeObjectURL(url));
  
    for (const key in this.imageUrlCache) {
      if (this.imageUrlCache[key].startsWith('blob:')) {
        URL.revokeObjectURL(this.imageUrlCache[key]);
      }
    }
    this.imageUrlCache = {};
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    this.comments = this.comments.map(c => ({
      ...c,
      showDropdown: false
    }));
    this.showBlogDropdown = false;
  }

  toggleDropdown(comment: Comment, event: MouseEvent): void {
    event.stopPropagation();
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
      console.log('Fetched current user from local storage:', this.currentUser);
      if (this.currentUser && !this.currentUser._id) {
        this.currentUser._id = (this.currentUser as any).id || this.currentUser._id;
        console.log('Updated currentUser with _id:', this.currentUser._id);
      }
    } else {
      console.error('Current user not found in local storage');
    }
  }

  fetchBlog(blogId: string): void {
    this.blogSubscription = this.blogService.getBlogById(blogId).subscribe(
      (blog: Blog) => {
        if (blog) {
          this.blog = blog;
          this.originalBlog = JSON.parse(JSON.stringify(blog));
          if (blog.user_id) {
            this.fetchUser(blog.user_id);
          }
          this.fetchComments(blogId);
        } else {
          // Blog not found, redirect to blogs list
          console.log('Blog not found, redirecting to blogs list');
          this.router.navigate(['/blogs']);
        }
      },
      (error) => {
        console.error('Error fetching blog:', error);
        // In case of error, also redirect to blogs list
        this.router.navigate(['/blogs']);
      }
    );
  }

  async deleteBlog(blogId: string): Promise<void> {
    if (!blogId) {
      console.error('Blog ID is undefined');
      return;
    }
  
    const confirmed = await this.confirmationDialogService.confirm(
      'Confirm Deletion',
      'Are you sure you want to delete this blog?'
    );
  
    if (confirmed) {
      this.blogService.deleteBlog(blogId).subscribe(
        () => {
          console.log('Successfully deleted blog with ID:', blogId);
          // Replace the current history entry
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
    this.titleError = null; // Reset the error
  
    if (!this.blog || !this.blog._id) return;
    
    if (!this.blog.title || this.blog.title.trim().length === 0) {
      this.titleError = 'Title is required';
      return;
    }
    
    if (this.blog.title.length > this.maxTitleLength) {
      this.titleError = 'Title exceeds maximum length';
      return;
    }
  
    if (!this.blog.image_1) {
      this.fileSizeError['image_1'] = 'Image 1 is required';
      return;
    }
  
    if (this.hasFormErrors()) return;
  
    // Mark the blog as edited
    this.blog.isEdited = true;
  
    this.blogService.updateBlog(this.blog._id, this.blog).subscribe(
      (updatedBlog: Blog) => {
        console.log('Blog updated successfully:', updatedBlog);
        this.blog = updatedBlog;
        this.originalBlog = JSON.parse(JSON.stringify(updatedBlog));
        this.isEditMode = false;
        this.formSubmitted = false;
        this.titleError = null; // Clear the error on successful update
      },
      (error) => {
        console.error('Error updating blog:', error);
        this.formSubmitted = false;
      }
    );
  }

  checkTitleValidity(): void {
    if (this.blog){
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
    this.blog = JSON.parse(JSON.stringify(this.originalBlog));
    this.isEditMode = false;
    this.titleError = null; // Clear the title error
  }

  deleteImage(section: number): void {
    if (this.blog) {
      (this.blog as any)[`image_${section}`] = '';
    }
  }

  onFileChange(event: any, fieldName: string): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.fileSizeError[fieldName] = 'File size exceeds 2 MB';
        this.fileTypeError[fieldName] = '';
      } else if (!file.type.startsWith('image/')) {
        this.fileTypeError[fieldName] = 'Invalid file type';
        this.fileSizeError[fieldName] = '';
      } else {
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
      // If no file is selected for image_1, keep the existing image
      // You might want to show a message to the user that no new image was selected
      console.log('No new image selected for Image 1. Keeping existing image.');
    }
  }

  fetchUser(userId: string): void {
    this.userSubscription = this.userService.getUserById(userId).subscribe(
      (user: User) => {
        this.user = user;
        console.log('User:', user);
        console.log('User image file:', user.imageFile);
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
  }

  fetchComments(blogId: string): void {
    this.commentSubscription = this.commentService.getCommentsByBlogId(blogId).subscribe(
      (comments: Comment[]) => {
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
        if (this.currentUser) {
          this.comments.forEach(comment => {
            console.log(`Comparing: comment.user._id (${comment.user._id}) === currentUser._id (${this.currentUser!._id})`);
          });
        }
        this.cd.detectChanges();
      },
      (error) => {
        console.error('Error fetching comments:', error);
      }
    );
  }

  checkCommentLength(type: string): void {
    if (type === 'new') {
      this.isNewCommentTooLong = this.newComment.length > this.maxCommentLength;
    } else if (type === 'edit') {
      this.isEditCommentTooLong = this.editCommentText.length > this.maxCommentLength;
    }
  }

  addComment(): void {
    if (!this.newComment.trim() || this.isNewCommentTooLong) return;

    if (this.currentUser && this.currentUser._id) {
      const commentData: Comment = {
        user: {
          _id: this.currentUser._id,
          username: this.currentUser.username,
          imageFile: this.currentUser.imageFile || 'assets/garden-nexus-logo.webp'
        },
        blogId: this.blog?._id || '',
        comment: this.newComment,
        createdAt: new Date()
      };

      this.commentService.createComment(commentData).subscribe(
        (comment: Comment) => {
          const user = comment.user as User;
          const userId = user._id ? user._id.toString() : (user.id ? user.id.toString() : '');
          const commentId = comment._id ? comment._id.toString() : (comment.id ? comment.id.toString() : '');
          const newComment: Comment = {
            ...comment,
            _id: commentId,
            user: {
              ...user,
              _id: userId
            }
          };
          this.comments = [...this.comments, newComment];
          this.newComment = '';
          this.isNewCommentTooLong = false;
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
  
    const confirmed = await this.confirmationDialogService.confirm(
      'Confirm Deletion',
      'Are you sure you want to delete this comment?'
    );
  
    if (confirmed) {
      this.commentService.deleteCommentById(commentId).subscribe(
        () => {
          console.log('Successfully deleted comment with ID:', commentId);
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
    this.commentBeingEdited = comment;
    this.editCommentText = comment.comment;
    this.isEditCommentTooLong = false;
    setTimeout(() => {
      const textarea = document.querySelector('.edit-comment-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    });
  }

  cancelEditComment(): void {
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
  
    this.comments = this.comments.map(c =>
      c._id === updatedComment._id ? { ...updatedComment, comment: `${updatedComment.comment} ` } : c
    );
    this.commentBeingEdited = null;
    this.editCommentText = '';
    this.cd.detectChanges();
  
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

    const cacheKey = JSON.stringify(imageFile);
    if (this.imageUrlCache[cacheKey]) {
      return this.imageUrlCache[cacheKey];
    }

    let url: string;
    if (imageFile && imageFile.type === 'Buffer' && Array.isArray(imageFile.data)) {
      const uint8Array = new Uint8Array(imageFile.data);
      const blob = new Blob([uint8Array], { type: 'image/jpeg' });
      url = URL.createObjectURL(blob);
      this.imageUrls.push(url);
    } else if (typeof imageFile === 'string') {
      url = imageFile;
    } else {
      url = 'assets/garden-nexus-logo.webp';
    }

    this.imageUrlCache[cacheKey] = url;
    return url;
  }

  private hasFormErrors(): boolean {
    if (!this.blog) return true;
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

  // Add this method to check if content is too short
  isContentTooShort(section: 'content_section_1' | 'content_section_2' | 'content_section_3'): boolean {
    const content = this.blog![section];
    if (!content) return false; // Optional sections are not considered too short if empty
    const wordCount = this.getContentWordCount(content);
    return wordCount > 0 && wordCount < this.minContentWords;
  }

  // Add this method to check if content is too long
  isContentTooLong(section: 'content_section_1' | 'content_section_2' | 'content_section_3'): boolean {
    const content = this.blog![section];
    if (!content) return false;
    return this.getContentWordCount(content) > this.maxContentWords;
  }

  hasImageErrors(): boolean {
    return Object.values(this.fileSizeError).some(error => !!error) || Object.values(this.fileTypeError).some(error => !!error);
  }

  addAutoGrow(): void {
    const textareas = document.querySelectorAll('.auto-grow') as NodeListOf<HTMLTextAreaElement>;
    textareas.forEach(textarea => {
      this.autoGrow.call(textarea);
      textarea.addEventListener('input', this.autoGrow.bind(textarea), false);
    });
    this.cd.detectChanges();
  }
  
  autoGrow(this: HTMLTextAreaElement): void {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  }

  toggleCategory(category: string): void {
    const index = this.blog!.categories.indexOf(category);
    if (index === -1) {
      this.blog!.categories.push(category);
    } else {
      this.blog!.categories.splice(index, 1);
    }
  }

  quoteComment(): void {}
}
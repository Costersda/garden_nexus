import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogService } from '../../../shared/services/blog.service';
import { Blog } from '../../../shared/types/blog.interface';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/types/user.interface';
import { CommentService } from '../../../shared/services/comment.service';
import { Comment } from '../../../shared/types/comment.interface';

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

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private userService: UserService,
    private commentService: CommentService,
    private router: Router,
    private cd: ChangeDetectorRef
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
    // Revoke all created object URLs
  this.imageUrls.forEach(url => URL.revokeObjectURL(url));
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    this.comments = this.comments.map(c => ({
      ...c,
      showDropdown: false
    }));
  }

  toggleDropdown(comment: Comment, event: MouseEvent): void {
    event.stopPropagation();
    this.comments = this.comments.map(c => ({
      ...c,
      showDropdown: c._id === comment._id ? !c.showDropdown : false
    }));
  }

  fetchCurrentUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      console.log('Fetched current user from local storage:', this.currentUser);
      if (this.currentUser && !this.currentUser._id) {
        this.currentUser._id = (this.currentUser as any).id || this.currentUser._id; // Ensure _id is set
        console.log('Updated currentUser with _id:', this.currentUser._id);
      }
    } else {
      console.error('Current user not found in local storage');
    }
  }

  fetchBlog(blogId: string): void {
    this.blogSubscription = this.blogService.getBlogById(blogId).subscribe(
      (blog: Blog) => {
        this.blog = blog;
        if (blog.user_id) {
          this.fetchUser(blog.user_id);
        }
        this.fetchComments(blogId); // Ensure comments are fetched after blog data
      },
      (error) => {
        console.error('Error fetching blog:', error);
      }
    );
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
        this.cd.detectChanges(); // Manually trigger change detection
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

  deleteComment(commentId: string | undefined): void {
    console.log('Attempting to delete comment with ID:', commentId);

    if (!commentId) {
      console.error('Comment ID is undefined');
      return;
    }

    this.commentService.deleteCommentById(this.blog?._id || '', commentId).subscribe(
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

  editComment(comment: Comment): void {
    this.commentBeingEdited = comment;
    this.editCommentText = comment.comment;
    this.isEditCommentTooLong = false;
  }

  saveEditedComment(): void {
    if (!this.editCommentText.trim() || !this.commentBeingEdited || this.isEditCommentTooLong) return;
  
    const updatedComment = {
      ...this.commentBeingEdited,
      comment: this.editCommentText,
      isEdited: true
    };
  
    // Update local state immediately
    this.comments = this.comments.map(c =>
      c._id === updatedComment._id ? { ...updatedComment, comment: `${updatedComment.comment} ` } : c
    );
    this.commentBeingEdited = null;
    this.editCommentText = '';
    this.cd.detectChanges();
  
    // Then make the API call
    this.commentService.updateCommentById(this.blog!._id!, updatedComment._id!, updatedComment).subscribe(
      (comment: Comment) => {
        console.log('Updated comment:', comment);
        // No need to update local state again, as it's already updated
      },
      (error) => {
        console.error('Error editing comment:', error);
        // Revert the local change if the API call fails
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
    if (imageFile && imageFile.type === 'Buffer' && Array.isArray(imageFile.data)) {
      // Convert Buffer to Uint8Array
      const uint8Array = new Uint8Array(imageFile.data);
      // Convert Uint8Array to blob
      const blob = new Blob([uint8Array], { type: 'image/jpeg' });
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      // Store the URL for later revocation
      this.imageUrls.push(url);
      return url;
    } else if (typeof imageFile === 'string') {
      return imageFile;
    }
    return 'assets/garden-nexus-logo.webp'; // Make sure this file exists
  }
}

import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ForumService } from '../../../shared/services/forum.service';
import { Forum } from '../../../shared/types/forum.interface';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/types/user.interface';
import { CommentService } from '../../../shared/services/comment.service';
import { Comment } from '../../../shared/types/comment.interface';
import { ConfirmationDialogService } from '../../../shared/modules/confirmation-dialog/confirmation-dialog.service';
import { Category, CATEGORIES } from '../../../shared/types/category.interface';

@Component({
  selector: 'app-view-forum',
  templateUrl: './viewForum.component.html',
})
export class ViewForumComponent implements OnInit, OnDestroy {
  // Main Data Objects
  forum: Forum | null = null;
  user: User | null = null;
  currentUser: User | null = null;
  originalForum: Forum | null = null;

  // Comments-related
  comments: Comment[] = [];
  newComment: string = '';
  commentBeingEdited: Comment | null = null;
  editCommentText: string = '';
  replyingToComment: Comment | null = null;
  replyText: string = '';

  // Subscriptions
  private routeSubscription!: Subscription;
  private forumSubscription!: Subscription;
  private userSubscription!: Subscription;
  private commentSubscription!: Subscription;

  // UI State Flags
  isNewCommentTooLong: boolean = false;
  isEditCommentTooLong: boolean = false;
  showForumDropdown: boolean = false;
  isEditMode: boolean = false;
  formSubmitted: boolean = false;

  // Configuration Constants
  maxCommentLength: number = 600;
  maxTitleLength: number = 100;
  minContentLength: number = 200;
  maxContentLength: number = 1000;

  // Miscellaneous
  source: string | null = null;
  username: string | null = null;
  categories: Category[] = CATEGORIES;

  // Image-related
  private imageUrls: string[] = [];
  private imageUrlCache: { [key: string]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private userService: UserService,
    private commentService: CommentService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit(): void {
    // Subscribe to route parameters and query parameters
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const forumId = params.get('id');
      this.route.queryParams.subscribe(queryParams => {
        this.source = queryParams['source'] || null;
        this.username = queryParams['username'] || null;
      });
      if (forumId) {
        // Fetch current user, forum details, and comments
        this.fetchCurrentUser();
        this.fetchForum(forumId);
        // // Fetch initial comments (commented out console.log for production)
        // this.commentService.getCommentsByForumId(forumId).subscribe(
        //   // comments => console.log('Initial comments:', JSON.stringify(comments, null, 2))
        // );
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.forumSubscription) {
      this.forumSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.commentSubscription) {
      this.commentSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    // Close all comment dropdowns and forum dropdown when clicking outside
    this.comments = this.comments.map(c => ({
      ...c,
      showDropdown: false
    }));
    this.showForumDropdown = false;
  }

  toggleDropdown(comment: Comment, event: MouseEvent): void {
    // Toggle dropdown for a specific comment
    event.stopPropagation();
    this.comments = this.comments.map(c => ({
      ...c,
      showDropdown: c._id === comment._id ? !c.showDropdown : false
    }));
  }

  toggleForumDropdown(event: MouseEvent): void {
    // Toggle forum dropdown
    event.stopPropagation();
    this.showForumDropdown = !this.showForumDropdown;
  }

  fetchCurrentUser(): void {
    // Fetch current user from local storage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      // Ensure _id is set correctly
      if (this.currentUser && !this.currentUser._id) {
        this.currentUser._id = (this.currentUser as any).id || this.currentUser._id;
      }
    } else {
      // console.error('Current user not found in local storage');
    }
  }

  fetchForum(forumId: string): void {
    this.forumSubscription = this.forumService.getForumById(forumId).subscribe(
        (forum: Forum) => {
            if (forum) {
                this.forum = {
                    ...forum,
                    createdAt: new Date(forum.createdAt),
                    updatedAt: new Date(forum.updatedAt)
                };
                this.originalForum = {
                    ...this.forum
                };
                if (forum.user_id) {
                    this.fetchUser(forum.user_id);
                }
                this.fetchComments(forumId);
            } else {
                this.router.navigate(['/forum']);
            }
        },
        (error) => {
            console.error('Error fetching forum:', error);
            this.router.navigate(['/forum']);
        }
    );
}

  async deleteForum(forumId: string): Promise<void> {
    if (!forumId) {
      console.error('Forum ID is undefined');
      return;
    }

    // Show confirmation dialog before deleting
    const confirmed = await this.confirmationDialogService.confirm(
      'Confirm Deletion',
      'Are you sure you want to delete this forum post?'
    );

    if (confirmed) {
      // Delete the forum if confirmed
      this.forumService.deleteForum(forumId).subscribe(
        () => {
          // Replace the current history entry and navigate to forums list
          history.replaceState(null, '', '/forum');
          this.router.navigate(['/forum']);
        },
        (error) => {
          console.error('Error deleting forum:', error);
        }
      );
    }
  }

  toggleEditMode(): void {
    // Toggle edit mode and save changes if exiting edit mode
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.saveForumChanges();
    }
  }

  saveForumChanges(): void {
    this.formSubmitted = true;
    if (!this.forum || !this.forum._id) return;
    if (this.hasFormErrors()) return;

    // Mark the forum as edited
    this.forum.isEdited = true;

    // Update the forum in the database
    this.forumService.updateForum(this.forum._id, this.forum).subscribe(
      (updatedForum: Forum) => {
        this.forum = updatedForum;
        this.originalForum = JSON.parse(JSON.stringify(updatedForum));
        this.isEditMode = false;
        this.formSubmitted = false;
      },
      (error) => {
        console.error('Error updating forum:', error);
        this.formSubmitted = false;
      }
    );
  }

  cancelEdit(): void {
    if (this.originalForum) {
        this.forum = {
            ...this.originalForum,
            createdAt: new Date(this.originalForum.createdAt),
            updatedAt: new Date(this.originalForum.updatedAt)
        };
    }
    this.isEditMode = false;
}

  fetchUser(userId: string): void {
    // Fetch user details by ID
    this.userSubscription = this.userService.getUserById(userId).subscribe(
      (user: User) => {
        this.user = user;
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
  }

  getImageUrl(imageFile: any): string {
    // Return default image if no image file
    if (!imageFile) {
      return 'assets/garden-nexus-logo.webp';
    }

    // Check cache for existing URL
    const cacheKey = JSON.stringify(imageFile);
    if (this.imageUrlCache[cacheKey]) {
      return this.imageUrlCache[cacheKey];
    }

    let url: string;
    // Handle different image file formats
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

    // Cache the URL
    this.imageUrlCache[cacheKey] = url;
    return url;
  }

  fetchComments(forumId: string): void {
    // Fetch comments for the forum
    this.commentSubscription = this.commentService.getCommentsByForumId(forumId).subscribe(
      (comments: Comment[]) => {
        this.comments = comments.map(comment => {
          const commentId = comment._id ?? comment.id ?? '';

          // Handle comments with missing user information
          if (!comment.user) {
            // console.warn(`Comment ${commentId} has no user`);
            return {
              ...comment,
              _id: commentId,
              user: {
                _id: '',
                username: 'Unknown User',
                imageFile: undefined
              }
            };
          }

          const userId = comment.user._id || comment.user._id || '';

          return {
            ...comment,
            _id: commentId,
            user: {
              ...comment.user,
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
    // Check if the comment length exceeds the maximum allowed length
    if (type === 'new') {
      this.isNewCommentTooLong = this.newComment.length > this.maxCommentLength;
    } else if (type === 'edit') {
      this.isEditCommentTooLong = this.editCommentText.length > this.maxCommentLength;
    }
  }

  addComment(): void {
    // Add a new comment to the forum
    if (!this.newComment.trim() || this.isNewCommentTooLong) return;

    if (this.currentUser && this.currentUser._id) {
      const commentData: Comment = {
        user: {
          _id: this.currentUser.id,
          username: this.currentUser.username,
          imageFile: this.currentUser.imageFile || 'assets/garden-nexus-logo.webp'
        },
        forumId: this.forum?._id || '',
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

      this.commentService.createComment(commentData).subscribe(
        (comment: Comment) => {
          // Create a new comment object with all the necessary properties
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

          // Add the new comment to the end of the array
          this.comments = [...this.comments, newComment];

          // Reset comment-related variables
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
    // Delete a comment from the forum
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
    // Set up the comment for editing
    this.commentBeingEdited = comment;
    this.editCommentText = comment.comment;
    this.isEditCommentTooLong = false;
  }

  cancelEditComment(): void {
    // Cancel the comment editing process
    this.commentBeingEdited = null;
    this.editCommentText = '';
    this.isEditCommentTooLong = false;
  }

  saveEditedComment(): void {
    // Save the edited comment
    if (!this.editCommentText.trim() || !this.commentBeingEdited || this.isEditCommentTooLong) return;

    const updatedComment = {
      ...this.commentBeingEdited,
      comment: this.editCommentText,
      isEdited: true
    };

    // Update the comment in the local array
    this.comments = this.comments.map(c =>
      c._id === updatedComment._id ? { ...updatedComment, comment: `${updatedComment.comment} ` } : c
    );
    this.commentBeingEdited = null;
    this.editCommentText = '';
    this.cd.detectChanges();

    // Update the comment in the database
    this.commentService.updateCommentById(updatedComment._id!, updatedComment).subscribe(
      (comment: Comment) => {
        console.log('Updated comment:', comment);
      },
      (error) => {
        console.error('Error editing comment:', error);
        this.fetchComments(this.forum!._id!);
      }
    );
  }

  goBack(): void {
    // Navigate back based on the source of navigation
    if (this.source === 'profile' && this.username) {
      this.router.navigate(['/profile', this.username]);
    } else {
      this.router.navigate(['/forum']);
    }
  }

  public hasFormErrors(): boolean {
    // Check for form errors in the forum edit mode
    if (!this.forum) return true;
    const titleValid = this.forum?.title?.length <= this.maxTitleLength;
    const contentValid = this.forum?.content?.length >= this.minContentLength && this.forum?.content?.length <= this.maxContentLength;
    return !titleValid || !contentValid;
  }

  toggleCategory(category: string): void {
    // Toggle a category in the forum's category list
    if (!this.forum) return;
    const index = this.forum.categories.indexOf(category);
    if (index === -1) {
      this.forum.categories.push(category);
    } else {
      this.forum.categories.splice(index, 1);
    }
  }

  currentUserMatchesCommentUser(commentUser: any, currentUser: any): boolean {
    // Check if the current user matches the user who posted the comment
    if (!commentUser || !currentUser) return false;

    const commentUserId = (commentUser._id || commentUser.id || '').toString().trim();
    const currentUserId = (currentUser._id || currentUser.id || '').toString().trim();

    if (!commentUserId) {
      console.warn('Comment user ID is missing');
      return false;
    }

    return commentUserId === currentUserId;
  }

  quoteComment(comment: Comment) {
    // Set up a reply to a comment with a quote
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
    // Cancel the reply to a comment
    this.replyingToComment = null;
    this.replyText = '';
  }

  public detectChanges(): void {
    this.cd.detectChanges();
  }
}
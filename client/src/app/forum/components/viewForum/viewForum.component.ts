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
  forum: Forum | null = null;
  user: User | null = null;
  comments: Comment[] = [];
  newComment: string = '';
  source: string | null = null;
  username: string | null = null;
  private routeSubscription!: Subscription;
  private forumSubscription!: Subscription;
  private userSubscription!: Subscription;
  private commentSubscription!: Subscription;
  public currentUser: User | null = null;
  commentBeingEdited: Comment | null = null;
  editCommentText: string = '';
  isNewCommentTooLong: boolean = false;
  isEditCommentTooLong: boolean = false;
  maxCommentLength: number = 600;
  showForumDropdown: boolean = false;
  isEditMode: boolean = false;
  originalForum: Forum | null = null;
  formSubmitted: boolean = false;
  maxTitleLength: number = 100;
  minContentLength: number = 200;
  maxContentLength: number = 1000;
  categories: Category[] = CATEGORIES;
  private imageUrls: string[] = [];
  private imageUrlCache: { [key: string]: string } = {};
  replyingToComment: Comment | null = null;
  replyText: string = '';

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private userService: UserService,
    private commentService: CommentService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const forumId = params.get('id');
      this.route.queryParams.subscribe(queryParams => {
        this.source = queryParams['source'] || null;
        this.username = queryParams['username'] || null;
      });
      if (forumId) {
        this.fetchCurrentUser();
        this.fetchForum(forumId);
        // Add this line
        this.commentService.getCommentsByForumId(forumId).subscribe(
          // comments => console.log('Initial comments:', JSON.stringify(comments, null, 2))
        );
      }
    });
  }

  ngOnDestroy(): void {
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
    this.comments = this.comments.map(c => ({
      ...c,
      showDropdown: false
    }));
    this.showForumDropdown = false;
  }

  toggleDropdown(comment: Comment, event: MouseEvent): void {
    event.stopPropagation();
    this.comments = this.comments.map(c => ({
      ...c,
      showDropdown: c._id === comment._id ? !c.showDropdown : false
    }));
  }

  toggleForumDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showForumDropdown = !this.showForumDropdown;
  }

  fetchCurrentUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      // console.log('Current User:', this.currentUser);
      if (this.currentUser && !this.currentUser._id) {
        this.currentUser._id = (this.currentUser as any).id || this.currentUser._id;
        // console.log('Updated currentUser with _id:', this.currentUser._id);
      }
    } else {
      // console.error('Current user not found in local storage');
    }
  }

  fetchForum(forumId: string): void {
    this.forumSubscription = this.forumService.getForumById(forumId).subscribe(
      (forum: Forum) => {
        if (forum) {
          this.forum = forum;
          this.originalForum = JSON.parse(JSON.stringify(forum));
          if (forum.user_id) {
            this.fetchUser(forum.user_id);
          }
          this.fetchComments(forumId);
          // console.log("forum:", forum);
        } else {
          // Forum not found, redirect to forums list
          this.router.navigate(['/forum']);
        }
      },
      (error) => {
        console.error('Error fetching forum:', error);
        // In case of error, also redirect to forums list
        this.router.navigate(['/forum']);
      }
    );
  }

  async deleteForum(forumId: string): Promise<void> {
    if (!forumId) {
      console.error('Forum ID is undefined');
      return;
    }
  
    const confirmed = await this.confirmationDialogService.confirm(
      'Confirm Deletion',
      'Are you sure you want to delete this forum post?'
    );
  
    if (confirmed) {
      this.forumService.deleteForum(forumId).subscribe(
        () => {
          // console.log('Successfully deleted forum with ID:', forumId);
          // Replace the current history entry
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

    this.forumService.updateForum(this.forum._id, this.forum).subscribe(
      (updatedForum: Forum) => {
        // console.log('Forum updated successfully:', updatedForum);
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
    this.forum = JSON.parse(JSON.stringify(this.originalForum));
    this.isEditMode = false;
  }

  fetchUser(userId: string): void {
    this.userSubscription = this.userService.getUserById(userId).subscribe(
      (user: User) => {
        this.user = user;
        // console.log('User:', user);
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
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

  fetchComments(forumId: string): void {
    this.commentSubscription = this.commentService.getCommentsByForumId(forumId).subscribe(
      (comments: Comment[]) => {
        this.comments = comments.map(comment => {
          const commentId = comment._id ?? comment.id ?? '';
          
          if (!comment.user) {
            console.warn(`Comment ${commentId} has no user`);
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
        this.fetchComments(this.forum!._id!);
      }
    );
  }
  

  goBack(): void {
    if (this.source === 'profile' && this.username) {
      this.router.navigate(['/profile', this.username]);
    } else {
      this.router.navigate(['/forum']);
    }
  }

  private hasFormErrors(): boolean {
    if (!this.forum) return true;
    const titleValid = this.forum?.title?.length <= this.maxTitleLength;
    const contentValid = this.forum?.content?.length >= this.minContentLength && this.forum?.content?.length <= this.maxContentLength;
    return !titleValid || !contentValid;
  }

  toggleCategory(category: string): void {
    const index = this.forum!.categories.indexOf(category);
    if (index === -1) {
      this.forum!.categories.push(category);
    } else {
      this.forum!.categories.splice(index, 1);
    }
  }

  currentUserMatchesCommentUser(commentUser: any, currentUser: any): boolean {
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
    this.replyingToComment = null;
    this.replyText = '';
  }
}
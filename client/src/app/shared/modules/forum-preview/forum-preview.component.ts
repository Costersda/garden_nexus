import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Forum } from '../../../shared/types/forum.interface';
import { UserService } from '../../../shared/services/user.service';
import { CommentService } from '../../../shared/services/comment.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-forum-preview',
    templateUrl: './forum-preview.component.html',
    imports: [CommonModule, RouterModule]
})
export class ForumPreviewComponent implements OnInit, OnDestroy {
  @Input() forum!: Forum;
  @Input() source: string = 'forum';
  @Input() username?: string;
  forumAuthor: string = '';
  commentCount: number = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router, 
    private userService: UserService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.fetchForumAuthor();
    this.fetchCommentCount();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private fetchForumAuthor(): void {
    if (this.forum.user_id) {
      this.subscriptions.push(
        this.userService.getUserById(this.forum.user_id).subscribe(user => {
          this.forumAuthor = user.username;
        })
      );
    }
  }

  private fetchCommentCount(): void {
    if (this.forum._id) {
      this.subscriptions.push(
        this.commentService.getCommentsByForumId(this.forum._id).subscribe(comments => {
          this.commentCount = comments.length;
        })
      );
    }
  }

  // Generate preview content (first 30 words)
  get previewContent(): string {
    return this.forum.content.split(' ').slice(0, 30).join(' ') + '...';
  }

  // Navigate to forum with appropriate query parameters
  viewForum(id: string): void {
    const queryParams: any = this.source === 'profile' && this.username ? { source: 'profile', username: this.username } : { source: 'forum' };
    this.router.navigate(['/forum', id], { queryParams });
  }
}
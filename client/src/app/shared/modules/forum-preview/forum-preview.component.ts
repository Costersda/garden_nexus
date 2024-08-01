import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Forum } from '../../../shared/types/forum.interface';
import { UserService } from '../../../shared/services/user.service';
import { CommentService } from '../../../shared/services/comment.service';

@Component({
  selector: 'app-forum-preview',
  templateUrl: './forum-preview.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ForumPreviewComponent implements OnInit {
  @Input() forum!: Forum;
  @Input() source: string = 'forum';
  @Input() username?: string;
  forumAuthor: string = '';
  commentCount: number = 0;

  constructor(
    private router: Router, 
    private userService: UserService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    // Fetch forum author's username
    if (this.forum.user_id) {
      this.userService.getUserById(this.forum.user_id).subscribe(user => {
        this.forumAuthor = user.username;
      });
    }

    // Fetch and count comments for the forum
    if (this.forum._id) {
      this.commentService.getCommentsByForumId(this.forum._id).subscribe(comments => {
        this.commentCount = comments.length;
      });
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
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
  commentCount: number = 0; // Variable to hold the number of comments

  constructor(
    private router: Router, 
    private userService: UserService,
    private commentService: CommentService // Inject CommentService
  ) {}

  ngOnInit(): void {
    if (this.forum.user_id) {
      this.userService.getUserById(this.forum.user_id).subscribe(user => {
        this.forumAuthor = user.username;
      });
    }

    // Fetch comments for the forum and count them
    if (this.forum._id) {
      this.commentService.getCommentsByForumId(this.forum._id).subscribe(comments => {
        this.commentCount = comments.length;
      });
    }
  }

  get previewContent(): string {
    return this.forum.content.split(' ').slice(0, 30).join(' ') + '...';
  }

  viewForum(id: string): void {
    const queryParams: any = this.source === 'profile' && this.username ? { source: 'profile', username: this.username } : { source: 'forum' };
    this.router.navigate(['/forum', id], { queryParams });
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Forum } from '../../../shared/types/forum.interface';
import { UserService } from '../../../shared/services/user.service';

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

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    if (this.forum.user_id) {
      this.userService.getUserById(this.forum.user_id).subscribe(user => {
        this.forumAuthor = user.username;
      });
    }
  }

  get previewContent(): string {
    return this.forum.content.split(' ').slice(0, 150).join(' ') + '...';
  }

  viewForum(id: string): void {
    const queryParams: any = this.source === 'profile' && this.username ? { source: 'profile', username: this.username } : { source: 'forum' };
    this.router.navigate(['/forum', id], { queryParams });
  }
}

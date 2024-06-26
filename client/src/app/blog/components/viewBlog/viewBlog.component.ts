import { Component, OnInit, OnDestroy } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private userService: UserService,
    private commentService: CommentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const blogId = params.get('id');
      this.route.queryParams.subscribe(queryParams => {
        this.source = queryParams['source'] || null;
        this.username = queryParams['username'] || null;
      });
      if (blogId) {
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
  }

  fetchBlog(blogId: string): void {
    this.blogSubscription = this.blogService.getBlogById(blogId).subscribe(
      (blog: Blog) => {
        this.blog = blog;
        if (blog.user_id) {
          this.fetchUser(blog.user_id);
        }
        this.fetchComments(blogId); // Moved this here to ensure comments are fetched after blog data
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
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
  }
  

  fetchComments(blogId: string): void {
    this.commentSubscription = this.commentService.getCommentsByBlogId(blogId).subscribe(
      (comments: Comment[]) => {
        this.comments = comments;
      },
      (error) => {
        console.error('Error fetching comments:', error);
      }
    );
  }

  addComment(): void {
    if (!this.newComment.trim()) return;
  
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser && currentUser.id) {
      const commentData: Comment = {
        user: {
          _id: currentUser.id,
          username: currentUser.username,
          imageFile: currentUser.imageFile || 'assets/garden-nexus-logo.webp'
        },
        blogId: this.blog?._id || '',
        comment: this.newComment,
        createdAt: new Date()
      };
  
      this.commentService.createComment(commentData).subscribe(
        (comment: Comment) => {
          this.comments.push(comment);
          this.newComment = '';
        },
        (error) => {
          console.error('Error adding comment:', error);
        }
      );
    } else {
      console.error('Current user not found in local storage');
    }
  }

  goBack(): void {
    if (this.source === 'profile' && this.username) {
      this.router.navigate(['/profile', this.username]);
    } else {
      this.router.navigate(['/blogs']);
    }
  }
}

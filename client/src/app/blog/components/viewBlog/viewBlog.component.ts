import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogService } from '../../../shared/services/blog.service';
import { Blog } from '../../../shared/types/blog.interface';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/types/user.interface'; // Import the User interface

@Component({
  selector: 'app-view-blog',
  templateUrl: './viewBlog.component.html',
})
export class ViewBlogComponent implements OnInit, OnDestroy {
  blog: Blog | null = null;
  user: User | null = null;
  private routeSubscription!: Subscription;
  private blogSubscription!: Subscription;
  private userSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const blogId = params.get('id');
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
  }

  fetchBlog(blogId: string): void {
    this.blogSubscription = this.blogService.getBlogById(blogId).subscribe(
      (blog: Blog) => {
        this.blog = blog;
        if (blog.user_id) {
          this.fetchUser(blog.user_id);
        }
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
}

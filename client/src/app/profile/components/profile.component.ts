import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { Subscription } from 'rxjs';
import { BlogService } from '../../shared/services/blog.service';
import { Blog } from '../../shared/types/blog.interface';
import { User } from '../../shared/types/user.interface';
import { Forum } from '../../shared/types/forum.interface';
import { ForumService } from '../../shared/services/forum.service';
import { UserService } from '../../shared/services/user.service';
import { ConfirmationDialogService } from '../../shared/modules/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: User | null = null;
  blogs: Blog[] = [];
  displayedBlogs: Blog[] = [];
  forums: Forum[] = [];
  displayedForums: Forum[] = [];
  errorMessage: string | null = null;
  isOwner: boolean = false;
  isModalOpen: boolean = false;
  routeSubscription: Subscription | undefined;
  blogSubscription: Subscription | undefined;
  private forumSubscription!: Subscription | undefined;
  private initialForumsToShow = 3;
  private forumsIncrement = 3;
  private initialBlogsToShow = 3;
  private blogsIncrement = 3;
  showBlogDropdown: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private blogService: BlogService,
    private forumService: ForumService,
    private userService: UserService,
    private router: Router,
    private confirmationDialogService: ConfirmationDialogService // Inject the service
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      if (username) {
        this.fetchProfile(username);
        this.checkOwnership(username);
        this.fetchBlogsByUser(username);
        this.fetchForumsByUser(username);
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
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    this.showBlogDropdown = false;
  }

  fetchProfile(username: string): void {
    const url = `${environment.apiUrl}/profile/${username}`;
    this.http.get<User>(url).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.errorMessage = null;
        console.log('Profile fetched:', profile); // Log the profile to check isVerified status
      },
      error: (error) => {
        this.errorMessage = 'Error fetching profile';
        console.error('Error fetching profile:', error);
      }
    });
  }

  checkOwnership(username: string): void {
    this.authService.getCurrentUser().subscribe((currentUser) => {
      this.isOwner = currentUser ? currentUser.username === username : false;
    });
  }

  fetchBlogsByUser(username: string): void {
    this.blogSubscription = this.blogService.getBlogsByUser(username).subscribe(
      (blogs: Blog[]) => {
        this.blogs = blogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.displayedBlogs = this.blogs.slice(0, this.initialBlogsToShow);
      },
      (error) => {
        console.error('Error fetching blogs by user:', error);
      }
    );
  }

  loadMoreBlogs(): void {
    const currentLength = this.displayedBlogs.length;
    const nextLength = currentLength + this.blogsIncrement;
    this.displayedBlogs = this.blogs.slice(0, nextLength);
  }

  viewBlog(blogId: string | undefined): void {
    if (blogId && this.profile?.username) {
      this.router.navigate(['/blog', blogId], { queryParams: { source: 'profile', username: this.profile.username } });
    }
  }

  fetchForumsByUser(username: string): void {
    this.forumSubscription = this.forumService.getForumsByUser(username).subscribe(
      (forums: Forum[]) => {
        this.forums = forums.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.displayedForums = this.forums.slice(0, this.initialForumsToShow);
        console.log(forums);
      },
      (error) => {
        console.error('Error fetching forums by user:', error);
      }
    );
  }

  loadMoreForums(): void {
    const currentLength = this.displayedForums.length;
    const nextLength = currentLength + this.forumsIncrement;
    this.displayedForums = this.forums.slice(0, nextLength);
  }

  viewForum(forumId: string | undefined): void {
    if (forumId && this.profile?.username) {
      this.router.navigate(['/forum', forumId], { queryParams: { source: 'profile', username: this.profile.username } });
    }
  }

  openEditProfileModal(): void {
    if (this.isOwner) {
      this.isModalOpen = true;
    } else {
      this.router.navigate(['/login']); // Redirect to login if the user is not the owner
    }
  }

  toggleBlogDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showBlogDropdown = !this.showBlogDropdown;
  }

  async deleteProfile(): Promise<void> {
    const confirmed = await this.confirmationDialogService.confirm(
      'Delete Profile',
      '***<strong>WARNING</strong>***<br><br>Are you sure you want to delete your profile?<br><br> This action cannot be undone.'
    );
    

    if (confirmed) {
      this.userService.deleteProfile().subscribe(
        () => {
          console.log('Successfully deleted profile');
          this.authService.logout();
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Error deleting profile:', error);
          this.errorMessage = 'Failed to delete profile. Please try again.';
        }
      );
    }
  }

  resendVerificationEmail() {
    if (this.profile && this.profile.email) {
      this.userService.resendVerificationEmail(this.profile.email).subscribe(
        response => {
          console.log('Verification email resent successfully');
          // Refresh the profile data
          if (this.profile) {
            this.fetchProfile(this.profile.username);
          }
        },
        error => {
          console.error('Error resending verification email', error);
        }
      );
    }
  }
}

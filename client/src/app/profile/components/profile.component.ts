import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { catchError, filter, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { of, Subscription } from 'rxjs';
import { BlogService } from '../../shared/services/blog.service';
import { Blog } from '../../shared/types/blog.interface';
import { User } from '../../shared/types/user.interface';
import { Forum } from '../../shared/types/forum.interface';
import { ForumService } from '../../shared/services/forum.service';
import { UserService } from '../../shared/services/user.service';
import { ConfirmationDialogService } from '../../shared/modules/confirmation-dialog/confirmation-dialog.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserInterface } from '../../auth/types/currentUser.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  // User and profile related
  profile: User | null = null;
  isOwner: boolean = false;
  isFollowing: boolean = false;

  // Blog
  blogs: Blog[] = [];
  displayedBlogs: Blog[] = [];
  private initialBlogsToShow = 3;
  private blogsIncrement = 3;
  showBlogDropdown: boolean = false;

  // Forum
  forums: Forum[] = [];
  displayedForums: Forum[] = [];
  private initialForumsToShow = 3;
  private forumsIncrement = 3;

  // Following
  following: User[] = [];
  displayedFollowing: User[] = [];
  private initialFollowingToShow = 5;
  private followingIncrement = 5;
  // followingPageSize = 10;
  isLoadingFollowing: boolean = false;

  // UI state
  errorMessage: string | null = null;
  isModalOpen: boolean = false;

  // Subscriptions
  routeSubscription: Subscription | undefined;
  blogSubscription: Subscription | undefined;
  private forumSubscription!: Subscription | undefined;

  // Email cooldown
  private cooldownPeriod = 60000; // 1 minute in milliseconds
  private lastEmailSentTime: number = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private blogService: BlogService,
    private forumService: ForumService,
    private userService: UserService,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private confirmationDialogService: ConfirmationDialogService, // Inject the service
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Subscribe to route parameters
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      if (username) {
        this.fetchProfile(username);
        this.checkOwnership(username);
        this.fetchBlogsByUser(username);
        this.fetchForumsByUser(username);
        this.fetchFollowing();
      }
    });

    // Handle navigation events for smooth scrolling to verification box
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      const tree = this.router.parseUrl(this.router.url);
      if (tree.fragment === 'verification-box') {
        // Increase timeout and add error handling
        setTimeout(() => {
          const element = document.getElementById('verification-box');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          } else {
            console.error('Element with id "verification-box" not found');
          }
        }, 50);
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from subscriptions to prevent memory leaks
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.blogSubscription) {
      this.blogSubscription.unsubscribe();
    }
  }

  // Close blog dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    this.showBlogDropdown = false;
  }

  // Fetch user profile data
  fetchProfile(username: string): void {
    this.userService.getProfileByUsername(username).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.errorMessage = null;
        this.checkIfFollowing();
        this.fetchFollowing();
      },
      error: (error) => {
        this.errorMessage = 'Error fetching profile';
        console.error('Error fetching profile:', error);
      }
    });
  }

  // Check if the current user is the profile owner
  checkOwnership(username: string): void {
    this.authService.getCurrentUser().pipe(
      take(1),
      catchError(error => {
        console.error('Error fetching current user:', error);
        return of(null);
      })
    ).subscribe((currentUser: CurrentUserInterface | null) => {
      this.isOwner = currentUser ? currentUser.username === username : false;
    });
  }

  // Fetch blogs for the user
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

  // Load more blogs for pagination
  loadMoreBlogs(): void {
    const currentLength = this.displayedBlogs.length;
    const nextLength = currentLength + this.blogsIncrement;
    this.displayedBlogs = this.blogs.slice(0, nextLength);
  }

  // Navigate to a specific blog
  viewBlog(blogId: string | undefined): void {
    if (blogId && this.profile?.username) {
      this.router.navigate(['/blog', blogId], { queryParams: { source: 'profile', username: this.profile.username } });
    }
  }

  // Fetch forums for the user
  fetchForumsByUser(username: string): void {
    this.forumSubscription = this.forumService.getForumsByUser(username).subscribe(
      (forums: Forum[]) => {
        this.forums = forums.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.displayedForums = this.forums.slice(0, this.initialForumsToShow);
      },
      (error) => {
        console.error('Error fetching forums by user:', error);
      }
    );
  }

  // Load more forums for pagination
  loadMoreForums(): void {
    const currentLength = this.displayedForums.length;
    const nextLength = currentLength + this.forumsIncrement;
    this.displayedForums = this.forums.slice(0, nextLength);
  }

  // Navigate to a specific forum
  viewForum(forumId: string | undefined): void {
    if (forumId && this.profile?.username) {
      this.router.navigate(['/forum', forumId], { queryParams: { source: 'profile', username: this.profile.username } });
    }
  }

  // Open the edit profile modal or redirect to login
  openEditProfileModal(): void {
    if (this.isOwner) {
      this.isModalOpen = true;
    } else {
      this.router.navigate(['/login']); // Redirect to login if the user is not the owner
    }
  }

  // Toggle the blog dropdown menu
  toggleBlogDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showBlogDropdown = !this.showBlogDropdown;
  }

  // Delete user profile after confirmation
  async deleteProfile(): Promise<void> {
    if (!this.profile) {
      this.toastr.error('User profile not available');
      return;
  }
    const confirmed = await this.confirmationDialogService.confirm(
      'Delete Profile',
      '***<strong>WARNING</strong>***<br><br>Are you sure you want to delete your profile?<br><br> This action cannot be undone.'
    );

    if (confirmed) {
      this.userService.deleteProfile().subscribe(
        () => {
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

  // Resend verification email with cooldown period
  resendVerificationEmail() {
    if (!this.profile || !this.profile.email) {
      this.toastr.error('User profile not available');
      return;
    }

    const currentTime = Date.now();
    if (currentTime - this.lastEmailSentTime < this.cooldownPeriod) {
      const remainingTime = Math.ceil((this.cooldownPeriod - (currentTime - this.lastEmailSentTime)) / 1000);
      this.toastr.info(`Please wait ${remainingTime} seconds before requesting another email.`);
      return;
    }

    this.userService.resendVerificationEmail(this.profile.email).subscribe(
      response => {
        this.toastr.success('Verification email sent successfully. Please check your inbox.');
        this.lastEmailSentTime = Date.now();
        if (this.profile) {
          this.fetchProfile(this.profile.username);
        }
      },
      error => {
        console.error('Error resending verification email', error);
        this.toastr.error('Failed to send verification email. Please try again later.');
      }
    );
  }

  // Load more following users for pagination
  loadMoreFollowing(): void {
    const currentLength = this.displayedFollowing.length;
    const nextLength = currentLength + this.followingIncrement;
    this.displayedFollowing = this.following.slice(0, nextLength);
  }

  // Toggle follow/unfollow user
  toggleFollow() {
    if (this.isFollowing) {
      this.unfollowUser();
    } else {
      this.followUser();
    }
  }

  // Fetch users that the current profile is following
  fetchFollowing() {
    if (this.profile && this.profile.id) {
      this.isLoadingFollowing = true;
      this.userService.getFollowing(this.profile.id).subscribe({
        next: (following) => {
          this.following = following;
          this.displayedFollowing = this.following.slice(0, this.initialFollowingToShow);
          this.isLoadingFollowing = false;
        },
        error: (error) => {
          console.error('Error fetching following:', error);
          this.errorMessage = 'Failed to fetch following users. Please try again.';
          this.isLoadingFollowing = false;
        }
      });
    }
  }

  // Check if the current user is following the profile
  checkIfFollowing() {
    if (this.profile && this.profile.id) {
      this.userService.checkIfFollowing(this.profile.id).subscribe(
        isFollowing => {
          this.isFollowing = isFollowing;
        },
        error => {
          console.error('Error checking if following:', error);
        }
      );
    }
  }

  // Follow the current profile
  followUser() {
    if (this.profile && this.profile.id) {
      this.userService.followUser(this.profile.id).subscribe(
        () => {
          this.isFollowing = true;
        },
        error => {
          console.error('Error following user:', error);
          this.errorMessage = 'Failed to follow user. Please try again.';
        }
      );
    } else {
      this.errorMessage = 'Unable to follow user. Profile ID is missing.';
      console.error('Profile object:', this.profile);
    }
  }

  // Unfollow the current profile
  unfollowUser() {
    if (this.profile && this.profile.id) {
      this.userService.unfollowUser(this.profile.id).subscribe(
        () => {
          this.isFollowing = false;
        },
        error => {
          console.error('Error unfollowing user:', error);
          this.errorMessage = 'Failed to unfollow user. Please try again.';
        }
      );
    } else {
      this.errorMessage = 'Unable to unfollow user. Profile ID is missing.';
      console.error('Profile object:', this.profile);
    }
  }

  public getInitialBlogsToShow(): number {
    return this.initialBlogsToShow;
  }
}

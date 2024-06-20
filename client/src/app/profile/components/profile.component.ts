import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { Subscription } from 'rxjs';
import { BlogService } from '../../shared/services/blog.service';
import { Blog } from '../../shared/types/blog.interface';

interface Profile {
  email: string;
  username: string;
  country?: string;
  bio?: string;
  imageFile?: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: Profile | null = null;
  blogs: Blog[] = [];
  errorMessage: string | null = null;
  isOwner: boolean = false;
  isModalOpen: boolean = false; // Define the isModalOpen property
  routeSubscription: Subscription | undefined;
  blogSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      if (username) {
        this.fetchProfile(username);
        this.checkOwnership(username);
        this.fetchBlogsByUser(username);
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

  fetchProfile(username: string): void {
    const url = `${environment.apiUrl}/profile/${username}`;
    this.http.get<Profile>(url).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.errorMessage = null;
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
        this.blogs = blogs;
      },
      (error) => {
        console.error('Error fetching blogs by user:', error);
      }
    );
  }

  openEditProfileModal(): void {
    if (this.isOwner) {
      this.isModalOpen = true;
    } else {
      this.router.navigate(['/login']); // Redirect to login if the user is not the owner
    }
  }
}

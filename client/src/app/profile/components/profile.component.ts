import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { CurrentUserInterface } from '../../auth/types/currentUser.interface';

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
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  errorMessage: string | null = null;
  isOwner: boolean = false;
  isModalOpen: boolean = false; // Define the isModalOpen property

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.fetchProfile(username);
      this.checkOwnership(username);
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

  openEditProfileModal(): void {
    if (this.isOwner) {
      this.isModalOpen = true;
    } else {
      this.router.navigate(['/login']); // Redirect to login if the user is not the owner
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  isModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.fetchProfile(username);
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

  openEditProfileModal(): void {
    this.isModalOpen = true;
  }
}

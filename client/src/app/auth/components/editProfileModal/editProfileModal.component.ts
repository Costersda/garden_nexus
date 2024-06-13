import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CountryService } from '../../../shared/services/country.service';

interface Profile {
  email: string;
  username: string;
  country?: string;
  bio?: string;
  imageFile?: string;
}

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './editProfileModal.component.html',
})
export class EditProfileModalComponent implements OnChanges {
  @Input() profile: Profile | null = null;
  @Output() profileUpdated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  updatedProfile: Partial<Profile> = {};  // Use Partial<Profile> to only update selected fields
  countries: string[] = [];

  constructor(private http: HttpClient, private countryService: CountryService) {
    this.countries = this.countryService.getCountries();
  }

  ngOnChanges(): void {
    if (this.profile) {
      this.updatedProfile = {
        country: this.profile.country,
        bio: this.profile.bio,
        imageFile: this.profile.imageFile
      };
    }
  }

  saveProfile(): void {
    if (this.profile?.username) {
      const url = `${environment.apiUrl}/profile/${this.profile.username}`;
      this.http.put<Profile>(url, this.updatedProfile).subscribe({
        next: () => {
          this.profileUpdated.emit();
          this.close.emit();
        },
        error: (error) => {
          console.error('Error saving profile:', error);
        }
      });
    }
  }

  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.updatedProfile.imageFile = (reader.result as string).split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  cancel(): void {
    this.close.emit();
  }
}

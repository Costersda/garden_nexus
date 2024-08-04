import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../types/user.interface';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getProfileByUsername(username: string): Observable<User> {
    const url = `${environment.apiUrl}/profile/${username}`;
    return this.http.get<User>(url).pipe(
      catchError((error) => {
        console.error('Error fetching profile:', error);
        return throwError(() => new Error('Error fetching profile'));
      })
    );
  }

  getCurrentUser(): Observable<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token not found in local storage');
      return throwError(() => new Error('Token not found'));
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/current`, { headers });
  }

  deleteProfile(): Observable<any> {
    const url = `${this.apiUrl}/profile`;
    console.log('Delete profile URL:', url);
    return this.http.delete(url);
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, { password: newPassword });
  }

  followUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/follow`, {});
  }

  unfollowUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/unfollow`, {});
  }

  checkIfFollowing(userId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${userId}/is-following`);
  }

  getFollowing(userId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${userId}/following`);
  }
  
}

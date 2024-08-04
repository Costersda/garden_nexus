import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, filter, map, Observable, of } from 'rxjs';
import { CurrentUserInterface } from '../types/currentUser.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { RegisterRequestInterface } from '../types/registerRequest.interface';
import { LoginRequestInterface, LoginError } from '../types/loginRequest.interface';

@Injectable()
export class AuthService {
  currentUser$ = new BehaviorSubject<CurrentUserInterface | null | undefined>(undefined);
  isLogged$ = this.currentUser$.pipe(
    filter((currentUser) => currentUser !== undefined),
    map(Boolean)
  );

  constructor(private http: HttpClient) {
    const storedUser = this.getCurrentUserFromStorage();
    this.currentUser$.next(storedUser);
  }

  // Check if user is verified
  isUserVerified(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.isVerified ?? false)
    );
  }

  // Get current user from API
  getCurrentUser(): Observable<CurrentUserInterface> {
    const url = environment.apiUrl + '/user';
    return this.http.get<CurrentUserInterface>(url).pipe(
      map((currentUser) => {
        this.setCurrentUser(currentUser);
        return currentUser;
      })
    );
  }

  // Register new user
  register(registerRequest: RegisterRequestInterface): Observable<CurrentUserInterface> {
    const url = environment.apiUrl + '/users';
    return this.http.post<CurrentUserInterface>(url, registerRequest).pipe(
      map((currentUser) => {
        this.setCurrentUser(currentUser);
        return currentUser;
      })
    );
  }

  // Check if username or email is available
  checkCredentialsAvailability(username?: string, email?: string): Observable<{available: boolean, message?: string}> {
    let params = new HttpParams();
    if (username) params = params.append('username', username);
    if (email) params = params.append('email', email);
  
    const url = `${environment.apiUrl}/users/check-credentials`;
    return this.http.get<{available: boolean, message?: string}>(url, { params });
  }

  // Login user
  login(loginRequest: LoginRequestInterface): Observable<CurrentUserInterface | LoginError> {
    const url = environment.apiUrl + '/users/login';
    return this.http.post<CurrentUserInterface>(url, loginRequest).pipe(
      map((currentUser) => {
        this.setCurrentUser(currentUser);
        return currentUser;
      }),
      catchError((error) => {
        return of({ error: 'Incorrect email or password' } as LoginError);
      })
    );
  }

  // Set token in localStorage
  setToken(currentUser: CurrentUserInterface): void {
    localStorage.setItem('token', currentUser.token);
  }

  // Set current user in localStorage and BehaviorSubject
  setCurrentUser(currentUser: CurrentUserInterface | null): void {
    if (currentUser) {
      const userToStore = {
        id: currentUser.id,
        token: currentUser.token,
        username: currentUser.username,
        email: currentUser.email,
        isVerified: currentUser.isVerified
      };
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
    } else {
      localStorage.removeItem('currentUser');
    }
    this.currentUser$.next(currentUser);
  }

  // Get current user from localStorage
  getCurrentUserFromStorage(): CurrentUserInterface | null {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      return JSON.parse(userString) as CurrentUserInterface;
    }
    return null;
  }

  // Check if user is logged in
  isLoggedIn(): Observable<boolean> {
    return this.isLogged$;
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUser$.next(null);
  }

  // Check if token exists
  hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  // Clear token and user data
  clearToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
}
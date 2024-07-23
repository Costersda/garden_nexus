import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, filter, map, Observable, of } from 'rxjs';
import { CurrentUserInterface } from '../types/currentUser.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RegisterRequestInterface } from '../types/registerRequest.interface';
import { LoginRequestInterface, LoginError } from '../types/loginRequest.interface';

@Injectable()
export class AuthService {
  currentUser$ = new BehaviorSubject<CurrentUserInterface | null | undefined>(
    undefined
  );
  isLogged$ = this.currentUser$.pipe(
    filter((currentUser) => currentUser !== undefined),
    map(Boolean)
  );

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<CurrentUserInterface> {
    const url = environment.apiUrl + '/user';
    return this.http.get<CurrentUserInterface>(url).pipe(
      map((currentUser) => {
        this.setCurrentUser(currentUser);
        return currentUser;
      })
    );
  }

  register(
    registerRequest: RegisterRequestInterface
  ): Observable<CurrentUserInterface> {
    const url = environment.apiUrl + '/users';
    return this.http.post<CurrentUserInterface>(url, registerRequest).pipe(
      map((currentUser) => {
        this.setCurrentUser(currentUser);
        return currentUser;
      })
    );
  }

  checkCredentialsAvailability(username?: string, email?: string): Observable<{available: boolean, message?: string}> {
    let params = new HttpParams();
    if (username) params = params.append('username', username);
    if (email) params = params.append('email', email);
  
    const url = `${environment.apiUrl}/users/check-credentials`;
    return this.http.get<{available: boolean, message?: string}>(url, { params });
  }

  login(loginRequest: LoginRequestInterface): Observable<CurrentUserInterface | LoginError> {
    const url = environment.apiUrl + '/users/login';
    return this.http.post<CurrentUserInterface>(url, loginRequest).pipe(
      map((currentUser) => {
        this.setCurrentUser(currentUser);
        return currentUser;
      }),
      catchError((error) => {
        // Handle the error and return a custom error object
        return of({ error: 'Incorrect email or password' } as LoginError);
      })
    );
  }

  setToken(currentUser: CurrentUserInterface): void {
    localStorage.setItem('token', currentUser.token);
  }

  setCurrentUser(currentUser: CurrentUserInterface | null): void {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
    this.currentUser$.next(currentUser);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLogged$;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUser$.next(null);
  }
}

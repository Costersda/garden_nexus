import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../auth.service';
import { environment } from '../../../../environments/environment';
import { CurrentUserInterface } from '../../types/currentUser.interface';
import { RegisterRequestInterface } from '../../types/registerRequest.interface';
import { LoginRequestInterface, LoginError } from '../../types/loginRequest.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isUserVerified', () => {
    it('should return true for verified user', (done) => {
      service.currentUser$.next({ isVerified: true } as CurrentUserInterface);
      service.isUserVerified().subscribe(isVerified => {
        expect(isVerified).toBe(true);
        done();
      });
    });

    it('should return false for unverified user', (done) => {
      service.currentUser$.next({ isVerified: false } as CurrentUserInterface);
      service.isUserVerified().subscribe(isVerified => {
        expect(isVerified).toBe(false);
        done();
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user from API and update currentUser$', () => {
      const mockUser: CurrentUserInterface = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        token: 'mocktoken',
        isVerified: true
      };

      service.getCurrentUser().subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });
  });

  describe('register', () => {
    it('should register a new user and update currentUser$', () => {
      const mockUser: CurrentUserInterface = {
        id: '1',
        username: 'newuser',
        email: 'new@example.com',
        token: 'newtoken',
        isVerified: false
      };
      const registerRequest: RegisterRequestInterface = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password'
      };

      service.register(registerRequest).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(mockUser);

      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });
  });

  describe('checkCredentialsAvailability', () => {
    it('should check username availability', () => {
      const mockResponse = { available: true };
      
      service.checkCredentialsAvailability('testuser').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/check-credentials?username=testuser`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should check email availability', () => {
      const mockResponse = { available: false, message: 'Email already in use' };
      
      service.checkCredentialsAvailability(undefined, 'test@example.com').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/check-credentials?email=test@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('login', () => {
    it('should login user and update currentUser$', () => {
      const mockUser: CurrentUserInterface = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        token: 'mocktoken',
        isVerified: true
      };
      const loginRequest: LoginRequestInterface = {
        email: 'test@example.com',
        password: 'password'
      };

      service.login(loginRequest).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockUser);

      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should return error on failed login', () => {
      const loginRequest: LoginRequestInterface = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      service.login(loginRequest).subscribe(response => {
        expect(response).toEqual({ error: 'Incorrect email or password' } as LoginError);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/login`);
      expect(req.request.method).toBe('POST');
      req.error(new ErrorEvent('error'));
    });
  });

  describe('setToken', () => {
    it('should set token in localStorage', () => {
      const mockUser: CurrentUserInterface = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        token: 'mocktoken',
        isVerified: true
      };

      service.setToken(mockUser);
      expect(localStorage.getItem('token')).toBe('mocktoken');
    });
  });

  describe('setCurrentUser', () => {
    it('should set current user in localStorage and update currentUser$', () => {
      const mockUser: CurrentUserInterface = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        token: 'mocktoken',
        isVerified: true
      };

      service.setCurrentUser(mockUser);
      expect(JSON.parse(localStorage.getItem('currentUser')!)).toEqual(mockUser);
      
      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should remove current user from localStorage and update currentUser$ when null', () => {
      service.setCurrentUser(null);
      expect(localStorage.getItem('currentUser')).toBeNull();
      
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('getCurrentUserFromStorage', () => {
    it('should get current user from localStorage', () => {
      const mockUser: CurrentUserInterface = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        token: 'mocktoken',
        isVerified: true
      };
      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      const result = service.getCurrentUserFromStorage();
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user in localStorage', () => {
      const result = service.getCurrentUserFromStorage();
      expect(result).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when user is logged in', (done) => {
      service.currentUser$.next({ id: '1' } as CurrentUserInterface);
      service.isLoggedIn().subscribe(isLoggedIn => {
        expect(isLoggedIn).toBe(true);
        done();
      });
    });

    it('should return false when user is not logged in', (done) => {
      service.currentUser$.next(null);
      service.isLoggedIn().subscribe(isLoggedIn => {
        expect(isLoggedIn).toBe(false);
        done();
      });
    });
  });

  describe('logout', () => {
    it('should clear token and user data from localStorage and update currentUser$', () => {
      localStorage.setItem('token', 'mocktoken');
      localStorage.setItem('currentUser', JSON.stringify({ id: '1' }));

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('hasToken', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'mocktoken');
      expect(service.hasToken()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.hasToken()).toBe(false);
    });
  });

  describe('clearToken', () => {
    it('should clear token and user data from localStorage', () => {
      localStorage.setItem('token', 'mocktoken');
      localStorage.setItem('currentUser', JSON.stringify({ id: '1' }));

      service.clearToken();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });
});
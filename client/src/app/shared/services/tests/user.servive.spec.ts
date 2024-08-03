import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from '../user.service';
import { User } from '../../types/user.interface';
import { environment } from '../../../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserById', () => {
    it('should return an Observable<User>', () => {
      const dummyUser: User = {
        _id: '1', id: '1', email: 'test@test.com', username: 'testuser',
        isVerified: true, following: [], followers: []
      };

      service.getUserById('1').subscribe(user => {
        expect(user).toEqual(dummyUser);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyUser);
    });
  });

  describe('getProfileByUsername', () => {
    it('should return an Observable<User>', () => {
      const dummyUser: User = {
        _id: '1', id: '1', email: 'test@test.com', username: 'testuser',
        isVerified: true, following: [], followers: []
      };

      service.getProfileByUsername('testuser').subscribe(user => {
        expect(user).toEqual(dummyUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/testuser`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyUser);
    });

    it('should handle errors', () => {
      service.getProfileByUsername('nonexistent').subscribe({
        error: (error) => {
          expect(error.message).toBe('Error fetching profile');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile/nonexistent`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getCurrentUser', () => {
    it('should return an Observable<User> with Authorization header', () => {
      const dummyUser: User = {
        _id: '1', id: '1', email: 'test@test.com', username: 'testuser',
        isVerified: true, following: [], followers: []
      };
      const dummyToken = 'dummyToken';
      spyOn(localStorage, 'getItem').and.returnValue(dummyToken);

      service.getCurrentUser().subscribe(user => {
        expect(user).toEqual(dummyUser);
      });

      const req = httpMock.expectOne(`${apiUrl}/current`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${dummyToken}`);
      req.flush(dummyUser);
    });

    it('should throw an error if token is not found', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      service.getCurrentUser().subscribe({
        error: (error) => {
          expect(error.message).toBe('Token not found');
        }
      });
    });
  });

  describe('deleteProfile', () => {
    it('should send a DELETE request', () => {
      service.deleteProfile().subscribe();

      const req = httpMock.expectOne(`${apiUrl}/profile`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should send a POST request', () => {
      const email = 'test@test.com';
      service.resendVerificationEmail(email).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/resend-verification`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email });
      req.flush(null);
    });
  });

  describe('requestPasswordReset', () => {
    it('should send a POST request', () => {
      const email = 'test@test.com';
      service.requestPasswordReset(email).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email });
      req.flush(null);
    });
  });

  describe('resetPassword', () => {
    it('should send a POST request', () => {
      const token = 'resetToken';
      const newPassword = 'newPassword';
      service.resetPassword(token, newPassword).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/reset-password/${token}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ password: newPassword });
      req.flush(null);
    });
  });

  describe('followUser', () => {
    it('should send a POST request', () => {
      const userId = '1';
      service.followUser(userId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${userId}/follow`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('unfollowUser', () => {
    it('should send a POST request', () => {
      const userId = '1';
      service.unfollowUser(userId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${userId}/unfollow`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('checkIfFollowing', () => {
    it('should return an Observable<boolean>', () => {
      const userId = '1';
      service.checkIfFollowing(userId).subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}/is-following`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });
  });

  describe('getFollowing', () => {
    it('should return an Observable<User[]>', () => {
      const userId = '1';
      const dummyUsers: User[] = [
        { _id: '2', id: '2', email: 'user2@test.com', username: 'user2', isVerified: true, following: [], followers: [] },
        { _id: '3', id: '3', email: 'user3@test.com', username: 'user3', isVerified: true, following: [], followers: [] }
      ];

      service.getFollowing(userId).subscribe(users => {
        expect(users).toEqual(dummyUsers);
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}/following`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyUsers);
    });
  });
});
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { VerifiedAuthGuardService } from '../verifiedGuard.service';
import { AuthService } from '../auth.service';
import { BehaviorSubject } from 'rxjs';
import { CurrentUserInterface } from '../../types/currentUser.interface';

describe('VerifiedAuthGuardService', () => {
    let guardService: VerifiedAuthGuardService;
    let authServiceMock: Partial<AuthService>;
    let routerMock: jasmine.SpyObj<Router>;
    let currentUserSubject: BehaviorSubject<CurrentUserInterface | null | undefined>;
  
    beforeEach(() => {
      currentUserSubject = new BehaviorSubject<CurrentUserInterface | null | undefined>(undefined);
      authServiceMock = {
        currentUser$: currentUserSubject
      };
      routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
  
      TestBed.configureTestingModule({
        providers: [
          VerifiedAuthGuardService,
          { provide: AuthService, useValue: authServiceMock },
          { provide: Router, useValue: routerMock }
        ]
      });
  
      guardService = TestBed.inject(VerifiedAuthGuardService);
    });
  
    it('should be created', () => {
      expect(guardService).toBeTruthy();
    });
  
    it('should allow access when user is verified', (done) => {
      const verifiedUser: CurrentUserInterface = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        token: 'token123',
        isVerified: true
      };
      currentUserSubject.next(verifiedUser);
  
      guardService.canActivate().subscribe(canActivate => {
        expect(canActivate).toBe(true);
        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        done();
      });
    });
  
    it('should redirect to profile page when user is logged in but not verified', (done) => {
      const unverifiedUser: CurrentUserInterface = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        token: 'token123',
        isVerified: false
      };
      currentUserSubject.next(unverifiedUser);
  
      guardService.canActivate().subscribe(canActivate => {
        expect(canActivate).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/profile', 'testuser'], { fragment: 'verification-box' });
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        done();
      });
    });
  
    it('should redirect to login page when user is not logged in', (done) => {
      currentUserSubject.next(null);
  
      guardService.canActivate().subscribe(canActivate => {
        expect(canActivate).toBe(false);
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
        expect(routerMock.navigate).not.toHaveBeenCalled();
        done();
      });
    });
  
    it('should take only the first emission from currentUser$', (done) => {
      const unverifiedUser: CurrentUserInterface = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        token: 'token123',
        isVerified: false
      };
      currentUserSubject.next(unverifiedUser);
  
      guardService.canActivate().subscribe(() => {
        const verifiedUser: CurrentUserInterface = { ...unverifiedUser, isVerified: true };
        currentUserSubject.next(verifiedUser);
        expect(routerMock.navigate).toHaveBeenCalledTimes(1);
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        done();
      });
    });
  
  });
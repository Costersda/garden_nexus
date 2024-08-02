import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuardService } from '../authGuard.service';
import { AuthService } from '../auth.service';
import { BehaviorSubject, of } from 'rxjs';

describe('AuthGuardService', () => {
  let authGuardService: AuthGuardService;
  let authServiceMock: Partial<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;
  let isLoggedSubject: BehaviorSubject<boolean>;

  beforeEach(() => {
    isLoggedSubject = new BehaviorSubject<boolean>(false);
    authServiceMock = {
      isLogged$: isLoggedSubject.asObservable()
    };
    routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    authGuardService = TestBed.inject(AuthGuardService);
  });

  it('should be created', () => {
    expect(authGuardService).toBeTruthy();
  });

  it('should allow access when user is logged in', (done) => {
    isLoggedSubject.next(true);

    authGuardService.canActivate().subscribe(canActivate => {
      expect(canActivate).toBe(true);
      expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
      done();
    });
  });

  it('should redirect to login page when user is not logged in', (done) => {
    isLoggedSubject.next(false);

    authGuardService.canActivate().subscribe(canActivate => {
      expect(canActivate).toBe(false);
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
      done();
    });
  });
});
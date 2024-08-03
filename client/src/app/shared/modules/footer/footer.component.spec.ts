import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { FooterComponent } from './footer.component';
import { AuthService } from '../../../auth/services/auth.service';
import { CurrentUserInterface } from '../../../auth/types/currentUser.interface';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let currentUserSubject: BehaviorSubject<CurrentUserInterface | null>;

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<CurrentUserInterface | null>(null);
    authServiceMock = jasmine.createSpyObj('AuthService', [], { currentUser$: currentUserSubject });

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FooterComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({})
            }
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update currentUser when AuthService emits a new user', () => {
    const mockUser: CurrentUserInterface = {  
        id: '123',
        token: '123',
        email: 'testuser@example.com',
        username: 'testuser',
        isVerified: true, 
    };
    currentUserSubject.next(mockUser);
    expect(component.currentUser).toEqual(mockUser);
  });

  describe('goToProfile', () => {
    it('should navigate to login page when user is not authenticated', () => {
      component.currentUser = null;
      component.goToProfile();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should navigate to user profile when authenticated and on a different profile', () => {
        const mockUser: CurrentUserInterface = {  
            id: '123',
            token: '123',
            email: 'testuser@example.com',
            username: 'testuser',
            isVerified: true, 
        };
      component.currentUser = mockUser;
      spyOn(activatedRoute.snapshot.paramMap, 'get').and.returnValue('otheruser');
      component.goToProfile();
      expect(router.navigate).toHaveBeenCalledWith(['/profile', 'testuser']);
    });

    it('should not navigate when authenticated and already on own profile', () => {
        const mockUser: CurrentUserInterface = {  
            id: '123',
            token: '123',
            email: 'testuser@example.com',
            username: 'testuser',
            isVerified: true, 
        };
      component.currentUser = mockUser;
      spyOn(activatedRoute.snapshot.paramMap, 'get').and.returnValue('testuser');
      component.goToProfile();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('isActiveRoute', () => {
    it('should return true for root path when currentUrl is "/"', () => {
      component.currentUrl = '/';
      expect(component.isActiveRoute('/')).toBeTrue();
    });

    it('should return false for root path when currentUrl is not "/"', () => {
      component.currentUrl = '/other';
      expect(component.isActiveRoute('/')).toBeFalse();
    });

    it('should return true when currentUrl includes the given route', () => {
      component.currentUrl = '/profile/testuser';
      expect(component.isActiveRoute('/profile')).toBeTrue();
    });

    it('should return false when currentUrl does not include the given route', () => {
      component.currentUrl = '/settings';
      expect(component.isActiveRoute('/profile')).toBeFalse();
    });
  });
});
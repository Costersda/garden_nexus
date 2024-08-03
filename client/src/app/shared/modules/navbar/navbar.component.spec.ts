import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../auth/services/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { CurrentUserInterface } from '../../../auth/types/currentUser.interface';

// Mock AuthService
const authServiceMock = {
    currentUser$: new BehaviorSubject<CurrentUserInterface | null | undefined>(undefined)
  };

  describe('NavbarComponent', () => {
    let component: NavbarComponent;
    let fixture: ComponentFixture<NavbarComponent>;
    let authServiceMock: { currentUser$: BehaviorSubject<CurrentUserInterface | null | undefined> };
    let router: Router;

    beforeEach(async () => {
        authServiceMock = {
            currentUser$: new BehaviorSubject<CurrentUserInterface | null | undefined>(undefined)
        };

        await TestBed.configureTestingModule({
            imports: [NavbarComponent, RouterTestingModule],
            providers: [
                { provide: AuthService, useValue: authServiceMock }
            ]
        }).compileComponents();

        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update currentUser when AuthService emits a new user', () => {
        const mockUser: CurrentUserInterface = {
          id: '123',
          token: 'fake-token',
          username: 'testuser',
          email: 'testuser@example.com',
          isVerified: true
        };
      
        authServiceMock.currentUser$.next(mockUser);
      
        component.ngOnInit();
        
        expect(component.currentUser).toEqual(mockUser);
    });

    it('should update currentUrl on NavigationEnd event', () => {
        const mockUrl = '/test-url';
        (router.events as any).next(new NavigationEnd(1, mockUrl, mockUrl));
        expect(component.currentUrl).toBe(mockUrl);
    });

    it('should navigate to profile when user is logged in', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.currentUser = {
            id: '123',
            token: 'fake-token',
            username: 'testuser',
            email: 'testuser@example.com',
            isVerified: true
        };
        component.goToProfile();
        expect(navigateSpy).toHaveBeenCalledWith(['/profile', 'testuser']);
    });

    it('should navigate to login when user is not logged in', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.currentUser = null;
        component.goToProfile();
        expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('should correctly identify active routes', () => {
        component.currentUrl = '/test';
        expect(component.isActiveRoute('/test')).toBeTrue();
        expect(component.isActiveRoute('/')).toBeFalse();
    });

    it('should correctly identify root route', () => {
        component.currentUrl = '/';
        expect(component.isActiveRoute('/')).toBeTrue();
        expect(component.isActiveRoute('/test')).toBeFalse();
    });

    it('should unsubscribe from router events on destroy', () => {
        const unsubscribeSpy = spyOn(component['eventSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });
});
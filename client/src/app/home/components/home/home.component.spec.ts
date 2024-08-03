import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { HomeComponent } from './home.component';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { CurrentUserInterface } from '../../../auth/types/currentUser.interface';
import { Component, Input } from '@angular/core';
import { SlideInterface } from '../../../shared/modules/types/slide.interface';

// Mock components
@Component({ selector: 'app-toolbar', template: '' })
class MockToolbarComponent { }

@Component({ selector: 'app-navbar', template: '' })
class MockNavbarComponent { }

@Component({ selector: 'app-footer', template: '' })
class MockFooterComponent { }

@Component({
    selector: 'image-slider',
    template: '<div>Mock Image Slider</div>'
})
class MockImageSliderComponent {
    @Input() slides: SlideInterface[] = [];
}

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;
    let authServiceMock: jasmine.SpyObj<AuthService>;
    let routerMock: jasmine.SpyObj<Router>;
    let currentUserSubject: BehaviorSubject<CurrentUserInterface | null | undefined>;

    const mockUser: CurrentUserInterface = {
        id: '1',
        token: 'mockToken',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true
    };

    beforeEach(async () => {
        currentUserSubject = new BehaviorSubject<CurrentUserInterface | null | undefined>(null);
        authServiceMock = jasmine.createSpyObj('AuthService', [], {
          currentUser$: currentUserSubject.asObservable()
        });
        routerMock = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
                HomeComponent,
                MockToolbarComponent,
                MockNavbarComponent,
                MockFooterComponent,
                MockImageSliderComponent
            ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize slides', () => {
        expect(component.slides.length).toBe(5);
        expect(component.slides[0].title).toBe('lawn');
    });

    it('should subscribe to currentUser$ on init', fakeAsync(() => {
        component.ngOnInit();
        currentUserSubject.next(mockUser);
        tick();
        fixture.detectChanges();
        expect(component.currentUser).toEqual(mockUser);
      }));

    it('should unsubscribe on destroy', () => {
        const unsubscribeSpy = jasmine.createSpy('unsubscribe');
        component.isLoggedInSubscription = { unsubscribe: unsubscribeSpy } as any;
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    describe('Navigation methods', () => {
        it('should navigate to profile when user is logged in', () => {
            component.currentUser = mockUser;
            component.goToProfile();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/profile', mockUser.username]);
        });

        it('should navigate to login when user is not logged in', () => {
            component.currentUser = null;
            component.goToProfile();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        });

        it('should navigate to blogs', () => {
            component.goToBlogs();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/blogs']);
        });

        it('should navigate to forum', () => {
            component.goToForum();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/forum']);
        });
    });
});
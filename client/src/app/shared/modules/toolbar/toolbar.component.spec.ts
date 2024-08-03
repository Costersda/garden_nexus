import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { ToolbarComponent } from './toolbar.component';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../types/user.interface';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CurrentUserInterface } from '../../../auth/types/currentUser.interface';

describe('ToolbarComponent', () => {
    let component: ToolbarComponent;
    let fixture: ComponentFixture<ToolbarComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let httpMock: HttpTestingController;
    let router: Router;

    const mockCurrentUser: CurrentUserInterface = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        token: 'mock-token',
        isVerified: true
    };

    const mockUser: User = {
        _id: '123',
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        bio: 'A brief bio',
        imageFile: 'profile-pic-url',
        isVerified: true,
        following: [],
        followers: []
    };

    beforeEach(async () => {
        const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
            'getCurrentUser',
            'logout',
            'isLoggedIn'
        ]);

        // Set up default return values
        authServiceSpy.getCurrentUser.and.returnValue(of(mockCurrentUser));
        authServiceSpy.isLoggedIn.and.returnValue(of(false));

        await TestBed.configureTestingModule({
            imports: [
                ToolbarComponent,
                RouterTestingModule,
                HttpClientTestingModule
            ],
            providers: [
                { provide: AuthService, useValue: authServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ToolbarComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set authButtonLabel to "Login" when not logged in', () => {
        authService.isLoggedIn.and.returnValue(of(false));
        fixture.detectChanges();
        expect(component.authButtonLabel).toBe('Login');
    });

    it('should set authButtonLabel to "Logout" when logged in', () => {
        authService.isLoggedIn.and.returnValue(of(true));
        fixture.detectChanges();
        expect(component.authButtonLabel).toBe('Logout');
    });

    it('should fetch user profile when token exists', fakeAsync(() => {
        spyOn(localStorage, 'getItem').and.returnValue('mock-token');
        (authService.getCurrentUser as jasmine.Spy).and.returnValue(of(mockCurrentUser));

        fixture.detectChanges();

        const req = httpMock.expectOne(`${environment.apiUrl}/profile/${mockCurrentUser.username}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockUser);

        tick();

        expect(component.currentUser).toEqual(mockUser);
    }));

    it('should not fetch user profile when token does not exist', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);
        fixture.detectChanges();
        httpMock.expectNone(`${environment.apiUrl}/profile/${mockUser.username}`);
    });

    it('should navigate to login page when "Login" button is clicked', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.authButtonLabel = 'Login';
        component.onAuthAction();
        expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('should logout and navigate to home when "Logout" button is clicked', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.authButtonLabel = 'Logout';
        component.currentUser = mockUser;
        component.onAuthAction();
        expect(authService.logout).toHaveBeenCalled();
        expect(component.currentUser).toBeNull();
        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should handle error when fetching profile fails', fakeAsync(() => {
        spyOn(localStorage, 'getItem').and.returnValue('mock-token');
        (authService.getCurrentUser as jasmine.Spy).and.returnValue(of(mockCurrentUser));
        spyOn(console, 'error');

        fixture.detectChanges();

        const req = httpMock.expectOne(`${environment.apiUrl}/profile/${mockCurrentUser.username}`);
        req.error(new ErrorEvent('Network error'));

        tick();

        expect(console.error).toHaveBeenCalledWith('Error fetching profile:', jasmine.any(Object));
        expect(component.currentUser).toBeNull();
    }));
});
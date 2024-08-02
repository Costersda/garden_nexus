import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { VerificationPageGuardService } from '../verificationPageGuard.service';
import { AuthService } from '../auth.service';
import { BehaviorSubject } from 'rxjs';
import { CurrentUserInterface } from '../../types/currentUser.interface'; 

describe('VerificationPageGuardService', () => {
    let guardService: VerificationPageGuardService;
    let authServiceMock: Partial<AuthService>;
    let routerMock: jasmine.SpyObj<Router>;
    let currentUserSubject: BehaviorSubject<CurrentUserInterface | null | undefined>;

    beforeEach(() => {
        currentUserSubject = new BehaviorSubject<CurrentUserInterface | null | undefined>(undefined);
        authServiceMock = {
            currentUser$: currentUserSubject
        };
        routerMock = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                VerificationPageGuardService,
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });

        guardService = TestBed.inject(VerificationPageGuardService);
    });

    it('should be created', () => {
        expect(guardService).toBeTruthy();
    });

    it('should allow access when user is logged in but not verified', (done) => {
        const unverifiedUser: CurrentUserInterface = {
            id: '1',
            token: 'token123',
            username: 'testuser',
            email: 'test@example.com',
            isVerified: false
        };
        currentUserSubject.next(unverifiedUser);

        guardService.canActivate().subscribe(canActivate => {
            expect(canActivate).toBe(true);
            expect(routerMock.navigate).not.toHaveBeenCalled();
            done();
        });
    });

    it('should redirect to home page when user is verified', (done) => {
        const verifiedUser: CurrentUserInterface = {
            id: '1',
            token: 'token123',
            username: 'testuser',
            email: 'test@example.com',
            isVerified: true
        };
        currentUserSubject.next(verifiedUser);

        guardService.canActivate().subscribe(canActivate => {
            expect(canActivate).toBe(false);
            expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
            done();
        });
    });

    it('should redirect to login page when user is not logged in', (done) => {
        currentUserSubject.next(null);

        guardService.canActivate().subscribe(canActivate => {
            expect(canActivate).toBe(false);
            expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
            done();
        });
    });

    it('should take only the first emission from currentUser$', (done) => {
        const unverifiedUser: CurrentUserInterface = {
            id: '1',
            token: 'token123',
            username: 'testuser',
            email: 'test@example.com',
            isVerified: false
        };
        currentUserSubject.next(unverifiedUser);

        guardService.canActivate().subscribe(() => {
            const verifiedUser: CurrentUserInterface = { ...unverifiedUser, isVerified: true };
            currentUserSubject.next(verifiedUser);
            expect(routerMock.navigate).not.toHaveBeenCalled();
            done();
        });
    });
});
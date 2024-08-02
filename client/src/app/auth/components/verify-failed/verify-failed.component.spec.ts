import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyFailedComponent } from './verify-failed.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { CurrentUserInterface } from '../../types/currentUser.interface';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

// Mock components
@Component({ selector: 'app-toolbar', template: '' })
class MockToolbarComponent { }

@Component({ selector: 'app-navbar', template: '' })
class MockNavbarComponent { }

@Component({ selector: 'app-footer', template: '' })
class MockFooterComponent { }

describe('VerifyFailedComponent', () => {
    let component: VerifyFailedComponent;
    let fixture: ComponentFixture<VerifyFailedComponent>;
    let authServiceMock: any;
    let routerMock: any;
    let mockUser: CurrentUserInterface;
    let unsubscribeSpy: jasmine.Spy;

    beforeEach(async () => {
        mockUser = {
            id: "1",
            username: 'testuser',
            email: 'testuser@example.com',
            token: 'fake-token',
            isVerified: false,
        };

        authServiceMock = {
            currentUser$: of(mockUser),
        };

        routerMock = {
            navigate: jasmine.createSpy('navigate')
        };

        await TestBed.configureTestingModule({
            declarations: [
                VerifyFailedComponent,
                MockToolbarComponent,
                MockNavbarComponent,
                MockFooterComponent
            ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VerifyFailedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to currentUser on init', () => {
        expect(component.currentUser).toEqual(mockUser);
    });

    it('should unsubscribe on destroy', () => {
        const subscription = new Subscription();
        spyOn(subscription, 'unsubscribe');
        component.isLoggedInSubscription = subscription;
    
        component.ngOnDestroy();
        expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('should navigate to profile when currentUser is defined', () => {
        component.currentUser = mockUser;
        component.goToProfile();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/profile', mockUser.username], { fragment: 'verification-box' });
    });

    it('should navigate to login when currentUser is null', () => {
        component.currentUser = null;
        component.goToProfile();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should call goToProfile when the button is clicked', () => {
        spyOn(component, 'goToProfile');
        const button = fixture.debugElement.query(By.css('button')).nativeElement;
        button.click();
        expect(component.goToProfile).toHaveBeenCalled();
    });
});

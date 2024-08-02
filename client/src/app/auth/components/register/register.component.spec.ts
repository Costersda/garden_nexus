import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA, ComponentFactoryResolver, ViewContainerRef, ComponentRef, EventEmitter, ElementRef } from '@angular/core';
import { TermsOfServiceModalComponent } from '../termsOfServiceModal/termsOfServiceModal.component';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let componentFactoryResolverSpy: jasmine.SpyObj<ComponentFactoryResolver>;
    let viewContainerRefSpy: jasmine.SpyObj<ViewContainerRef>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['register', 'setToken', 'setCurrentUser']);
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigateByUrl']);
        const componentFactoryResolverSpyObj = jasmine.createSpyObj('ComponentFactoryResolver', ['resolveComponentFactory']);
        const viewContainerRefSpyObj = jasmine.createSpyObj('ViewContainerRef', ['createComponent', 'clear']);
    
        await TestBed.configureTestingModule({
            declarations: [RegisterComponent, TermsOfServiceModalComponent],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpyObj },
                { provide: ComponentFactoryResolver, useValue: componentFactoryResolverSpyObj },
                { provide: ViewContainerRef, useValue: viewContainerRefSpyObj }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        componentFactoryResolverSpy = TestBed.inject(ComponentFactoryResolver) as jasmine.SpyObj<ComponentFactoryResolver>;
        viewContainerRefSpy = TestBed.inject(ViewContainerRef) as jasmine.SpyObj<ViewContainerRef>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with empty fields', () => {
        expect(component.form.get('email')?.value).toBe('');
        expect(component.form.get('username')?.value).toBe('');
        expect(component.form.get('password')?.value).toBe('');
        expect(component.form.get('confirmPassword')?.value).toBe('');
        expect(component.form.get('agreeToTerms')?.value).toBe(false);
    });

    it('should mark form as invalid when empty', () => {
        expect(component.form.valid).toBeFalsy();
    });

    it('should mark form as valid when all fields are correctly filled', () => {
        component.form.patchValue({
            email: 'test@example.com',
            username: 'testuser',
            password: 'Password123',
            confirmPassword: 'Password123',
            agreeToTerms: true
        });
        expect(component.form.valid).toBeTruthy();
    });

    it('should validate password strength', () => {
        const passwordControl = component.form.get('password');
        passwordControl?.setValue('weakpassword');
        expect(passwordControl?.hasError('passwordStrength')).toBeTruthy();
        passwordControl?.setValue('StrongPassword123');
        expect(passwordControl?.hasError('passwordStrength')).toBeFalsy();
    });

    it('should validate password match', () => {
        component.form.patchValue({
            password: 'Password123',
            confirmPassword: 'DifferentPassword123'
        });
        expect(component.form.hasError('passwordMismatch')).toBeTruthy();
        component.form.patchValue({
            confirmPassword: 'Password123'
        });
        expect(component.form.hasError('passwordMismatch')).toBeFalsy();
    });

    it('should call AuthService.register with form values on submit', fakeAsync(() => {
        const testUser = {
            email: 'test@example.com',
            username: 'testuser',
            password: 'Password123'
        };
        component.form.patchValue({
            ...testUser,
            confirmPassword: 'Password123',
            agreeToTerms: true
        });
        authServiceSpy.register.and.returnValue(of({ ...testUser, id: '123', token: 'fake-token', isVerified: false }));

        component.onSubmit();
        tick();

        expect(authServiceSpy.register).toHaveBeenCalledWith(testUser);
    }));

    it('should navigate to profile page on successful registration', fakeAsync(() => {
        const testUser = {
            email: 'test@example.com',
            username: 'testuser',
            password: 'Password123'
        };
        component.form.patchValue({
            ...testUser,
            confirmPassword: 'Password123',
            agreeToTerms: true
        });
        const registrationResponse = { ...testUser, id: '123', token: 'fake-token', isVerified: false };
        authServiceSpy.register.and.returnValue(of(registrationResponse));

        component.onSubmit();
        tick();

        expect(authServiceSpy.setToken).toHaveBeenCalledWith(registrationResponse);
        expect(authServiceSpy.setCurrentUser).toHaveBeenCalledWith(registrationResponse);
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/profile/testuser');
    }));

    it('should handle registration errors', fakeAsync(() => {
        component.form.patchValue({
            email: 'test@example.com',
            username: 'testuser',
            password: 'Password123',
            confirmPassword: 'Password123',
            agreeToTerms: true
        });
        const errorResponse = new HttpErrorResponse({
            error: ['Email already in use'],
            status: 400,
            statusText: 'Bad Request'
        });
        authServiceSpy.register.and.returnValue(throwError(() => errorResponse));

        component.onSubmit();
        tick();

        expect(component.errorMessages).toContain('Email already in use');
    }));

    it('should truncate username if it exceeds max length', () => {
        const event = { target: { value: 'a'.repeat(20) } } as any;
        component.onUsernameInput(event);
        expect(component.form.get('username')?.value.length).toBe(component.maxUsernameLength);
    });

    it('should truncate password if it exceeds max length', () => {
        const event = { target: { value: 'a'.repeat(100) } } as any;
        component.onPasswordInput(event);
        expect(component.form.get('password')?.value.length).toBe(component.maxPasswordLength);
    });

});

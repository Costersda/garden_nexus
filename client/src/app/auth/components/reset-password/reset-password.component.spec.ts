import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { UserService } from '../../../shared/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../../../auth/services/auth.service';
import { Component } from '@angular/core';

// Mock components
@Component({ selector: 'app-toolbar', template: '' })
class MockToolbarComponent {}

@Component({ selector: 'app-navbar', template: '' })
class MockNavbarComponent {}

@Component({ selector: 'app-footer', template: '' })
class MockFooterComponent {}

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const userServiceMock = jasmine.createSpyObj('UserService', ['resetPassword']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceMock = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getCurrentUser', 'logout']);
    
    authServiceMock.isLoggedIn.and.returnValue(of(false));
    authServiceMock.getCurrentUser.and.returnValue(of(null));

    const activatedRouteMock = {
      snapshot: {
        params: { token: 'testToken' }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
      declarations: [ 
        ResetPasswordComponent,
        MockToolbarComponent,
        MockNavbarComponent,
        MockFooterComponent
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ToastrService, useValue: {} },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.resetForm.get('password')?.value).toBe('');
    expect(component.resetForm.get('confirmPassword')?.value).toBe('');
  });

  it('should set token from route params', () => {
    expect(component.token).toBe('testToken');
  });

  it('should validate password strength', () => {
    const control = component.resetForm.get('password');
    control?.setValue('weakpass');
    expect(control?.hasError('passwordStrength')).toBeTruthy();
    
    control?.setValue('StrongPass1');
    expect(control?.hasError('passwordStrength')).toBeFalsy();
  });

  it('should validate password match', () => {
    component.resetForm.patchValue({
      password: 'StrongPass1',
      confirmPassword: 'DifferentPass1'
    });
    expect(component.resetForm.hasError('notSame')).toBeTruthy();
    
    component.resetForm.patchValue({
      confirmPassword: 'StrongPass1'
    });
    expect(component.resetForm.hasError('notSame')).toBeFalsy();
  });

  it('should show error for short password', () => {
    component.resetForm.patchValue({
      password: 'Short1',
      confirmPassword: 'Short1'
    });
    component.onSubmit();
    expect(component.errorMessage).toContain('Password must be at least 8 characters long');
  });

  it('should show error for long password', () => {
    const longPassword = 'A1' + 'a'.repeat(63);
    component.resetForm.patchValue({
      password: longPassword,
      confirmPassword: longPassword
    });
    component.onSubmit();
    expect(component.errorMessage).toContain('Password cannot be longer than 64 characters');
  });

  it('should reset password successfully', fakeAsync(() => {
    userServiceSpy.resetPassword.and.returnValue(of({}));
    component.resetForm.patchValue({
      password: 'StrongPass1',
      confirmPassword: 'StrongPass1'
    });
    component.onSubmit();
    tick();
    expect(component.successMessage).toContain('Password successfully reset');
    expect(component.isPasswordReset).toBeTruthy();
    tick(3000);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  }));

  it('should handle reset password error', fakeAsync(() => {
    userServiceSpy.resetPassword.and.returnValue(throwError(() => ({ error: { message: 'Error message' } })));
    component.resetForm.patchValue({
      password: 'StrongPass1',
      confirmPassword: 'StrongPass1'
    });
    component.onSubmit();
    tick();
    expect(component.errorMessage).toBe('Error message');
    expect(component.isPasswordReset).toBeFalsy();
  }));
});
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Add this interface to match the expected CurrentUserInterface
interface CurrentUserInterface {
  id: string;
  token: string;
  username: string;
  email: string;
  isVerified: boolean;
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'setToken', 'setCurrentUser']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty email and password', () => {
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('should mark form as invalid when empty', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('should mark form as valid when email and password are provided', () => {
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(component.form.valid).toBeTruthy();
  });

  it('should call AuthService.login with form values on submit', fakeAsync(() => {
    const testUser = { email: 'test@example.com', password: 'password123' };
    component.form.patchValue(testUser);
    authServiceSpy.login.and.returnValue(of({} as CurrentUserInterface));

    component.onSubmit();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalledWith(testUser);
  }));

  it('should navigate to profile page on successful login', fakeAsync(() => {
    const testUser = { email: 'test@example.com', password: 'password123' };
    component.form.patchValue(testUser);
    const loginResponse: CurrentUserInterface = {
      id: '123',
      token: 'fake-jwt-token',
      username: 'testuser',
      email: 'test@example.com',
      isVerified: true
    };
    authServiceSpy.login.and.returnValue(of(loginResponse));

    component.onSubmit();
    tick();

    expect(authServiceSpy.setToken).toHaveBeenCalledWith(loginResponse);
    expect(authServiceSpy.setCurrentUser).toHaveBeenCalledWith(loginResponse);
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/profile/testuser');
    expect(component.errorMessage).toBeNull();
  }));

  it('should set error message on login error from server', fakeAsync(() => {
    component.form.patchValue({ email: 'test@example.com', password: 'wrongpassword' });
    const errorResponse = { error: 'Invalid credentials' };
    authServiceSpy.login.and.returnValue(of(errorResponse));

    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe('Invalid credentials');
  }));

  it('should set generic error message on unexpected error', fakeAsync(() => {
    component.form.patchValue({ email: 'test@example.com', password: 'password123' });
    authServiceSpy.login.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe('An unexpected error occurred. Please try again.');
  }));
});
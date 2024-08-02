import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './forgot-password.component';
import { UserService } from '../../../shared/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    const userServiceMock = jasmine.createSpyObj('UserService', ['requestPasswordReset']);
    const toastrServiceMock = jasmine.createSpyObj('ToastrService', ['info']);

    await TestBed.configureTestingModule({
      declarations: [ ForgotPasswordComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    toastrServiceSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty email', () => {
    expect(component.forgotPasswordForm.get('email')?.value).toBe('');
  });

  it('should mark email as invalid when empty', () => {
    const emailControl = component.forgotPasswordForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalsy();
  });

  it('should mark email as invalid when format is incorrect', () => {
    const emailControl = component.forgotPasswordForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
  });

  it('should mark email as valid when format is correct', () => {
    const emailControl = component.forgotPasswordForm.get('email');
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.forgotPasswordForm.setValue({ email: '' });
    component.onSubmit();
    expect(userServiceSpy.requestPasswordReset).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Please enter a valid email address.');
  });

  it('should submit if form is valid and show success message', fakeAsync(() => {
    userServiceSpy.requestPasswordReset.and.returnValue(of({}));
    component.forgotPasswordForm.setValue({ email: 'test@example.com' });
    component.onSubmit();
    tick();
    expect(userServiceSpy.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    expect(component.successMessage).toBe('Password reset instructions have been sent to your email.');
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBeFalse();
  }));

  it('should show error message if password reset request fails', fakeAsync(() => {
    userServiceSpy.requestPasswordReset.and.returnValue(throwError(() => ({ error: { message: 'Error occurred' } })));
    component.forgotPasswordForm.setValue({ email: 'test@example.com' });
    component.onSubmit();
    tick();
    expect(userServiceSpy.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    expect(component.errorMessage).toBe('Error occurred');
    expect(component.successMessage).toBe('');
    expect(component.isLoading).toBeFalse();
  }));

  it('should prevent multiple submissions within cooldown period', fakeAsync(() => {
    userServiceSpy.requestPasswordReset.and.returnValue(of({}));
    component.forgotPasswordForm.setValue({ email: 'test@example.com' });
    component.onSubmit();
    tick();
    expect(userServiceSpy.requestPasswordReset).toHaveBeenCalledTimes(1);
    
    // Try to submit again immediately
    component.onSubmit();
    tick();
    expect(userServiceSpy.requestPasswordReset).toHaveBeenCalledTimes(1);
    expect(toastrServiceSpy.info).toHaveBeenCalled();
  }));

  it('should allow submission after cooldown period', fakeAsync(() => {
    userServiceSpy.requestPasswordReset.and.returnValue(of({}));
    component.forgotPasswordForm.setValue({ email: 'test@example.com' });
    component.onSubmit();
    tick();
    expect(userServiceSpy.requestPasswordReset).toHaveBeenCalledTimes(1);
    
    // Fast-forward time by cooldown period + 1 second
    tick(61000);
    
    component.onSubmit();
    tick();
    expect(userServiceSpy.requestPasswordReset).toHaveBeenCalledTimes(2);
  }));
});
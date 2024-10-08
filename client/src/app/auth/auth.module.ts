import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/authGuard.service';
import { ToolbarComponent } from '../shared/modules/toolbar/toolbar.component';
import { NavbarComponent } from '../shared/modules/navbar/navbar.component';
import { FooterComponent } from '../shared/modules/footer/footer.component';
import { LoggedInAuthGuardService } from './services/LoggedInAuthGuard.service';
import { VerifyFailedComponent } from './components/verify-failed/verify-failed.component';
import { VerifySuccessComponent } from './components/verify-success/verify-success.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [LoggedInAuthGuardService]
  },
  { 
    path: 'register', 
    component: RegisterComponent, 
    canActivate: [LoggedInAuthGuardService]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes), 
    ReactiveFormsModule, 
    CommonModule,
    ToolbarComponent,
    NavbarComponent,
    FooterComponent
  ],
  providers: [AuthService, AuthGuardService, LoggedInAuthGuardService],
  declarations: [RegisterComponent, LoginComponent, VerifyFailedComponent, VerifySuccessComponent, ForgotPasswordComponent, ResetPasswordComponent],
})
export class AuthModule {}

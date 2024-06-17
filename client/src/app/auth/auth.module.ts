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

const routes: Routes = [
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
    //canActivate: [AuthGuardService], This line stops the user from going to the login page
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
  providers: [AuthService, AuthGuardService],
  declarations: [RegisterComponent, LoginComponent],
})
export class AuthModule {}

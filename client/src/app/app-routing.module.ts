import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/components/profile.component';
import { HomeComponent } from './home/components/home/home.component';
import { LoginComponent } from './auth/components/login/login.component';
import { BlogComponent } from './blog/components/blog/blog.component';
import { ViewBlogComponent } from './blog/components/viewBlog/viewBlog.component';
import { CreateBlogComponent } from './blog/components/createBlog/createBlog.component';
import { ForumComponent } from './forum/components/forum/forum.component';
import { CreateForumComponent } from './forum/components/createForum/createForum.component';
import { ViewForumComponent } from './forum/components/viewForum/viewForum.component';
import { NotFoundComponent } from './404page/not-found.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { LoggedInAuthGuardService } from './auth/services/LoggedInAuthGuard.service';
import { AuthGuardService } from './auth/services/authGuard.service';
import { VerifiedAuthGuardService } from './auth/services/verifiedGuard.service';
import { HelpComponent } from './help/components/help.component';
import { VerifySuccessComponent } from './auth/components/verify-success/verify-success.component';
import { VerifyFailedComponent } from './auth/components/verify-failed/verify-failed.component';
import { VerificationPageGuardService } from './auth/services/verificationPageGuard.service';
import { ForgotPasswordComponent } from './auth/components/forgot-password/forgot-password.component';

const routes: Routes = [
  { path: 'profile/:username', 
    component: ProfileComponent,
    canActivate: [AuthGuardService] 
  },
  { path: '', component: HomeComponent },
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
  { path: 'forgot-password', 
    component: ForgotPasswordComponent,
    canActivate: [LoggedInAuthGuardService] },
  { path: 'blogs', component: BlogComponent },
  { path: 'blog/:id', component: ViewBlogComponent },
  { 
    path: 'blogs/create', 
    component: CreateBlogComponent,
    canActivate: [AuthGuardService, VerifiedAuthGuardService]
  },
  { path: 'forum', component: ForumComponent },
  { 
    path: 'forum/create', 
    component: CreateForumComponent,
    canActivate: [AuthGuardService, VerifiedAuthGuardService]
  },
  { path: 'forum/:id', component: ViewForumComponent },
  { path: 'help', component: HelpComponent },
  { path: 'verify-success', component: VerifySuccessComponent, canActivate: [VerificationPageGuardService]},
  { path: 'verify-failed', component: VerifyFailedComponent, canActivate: [VerificationPageGuardService] },
  { path: '**', component: NotFoundComponent, data: { redirectTo: '' } },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
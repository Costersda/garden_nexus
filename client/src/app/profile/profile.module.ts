import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './components/profile.component';
import { AuthGuardService } from '../auth/services/authGuard.service';
import { EditProfileModalComponent } from '../auth/components/editProfileModal/editProfileModal.component';
import { ToolbarComponent } from '../shared/modules/toolbar/toolbar.component';
import { NavbarComponent } from '../shared/modules/navbar/navbar.component';
import { FooterComponent } from '../shared/modules/footer/footer.component';
import { BlogPreviewComponent } from '../shared/modules/blog-preview/blog-preview.component';
import { ForumPreviewComponent } from '../shared/modules/forum-preview/forum-preview.component';

const routes: Routes = [
  { 
    path: 'profile/:username', 
    component: ProfileComponent,
    canActivate: [AuthGuardService] 
  }
];

@NgModule({
  declarations: [
    ProfileComponent,
    EditProfileModalComponent
  ],
  imports: [
    CommonModule, 
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    ToolbarComponent,
    NavbarComponent,
    FooterComponent,
    BlogPreviewComponent,
    ForumPreviewComponent
  ],
  exports: [
    ProfileComponent,
    EditProfileModalComponent
  ]
})
export class ProfileModule { }

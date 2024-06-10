import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './components/profile.component';
import { AuthGuardService } from '../auth/services/authGuard.service';

const routes: Routes = [
  { 
    path: 'profile/:username', 
    component: ProfileComponent,
    canActivate: [AuthGuardService] 
  }
];

@NgModule({
  declarations: [
    ProfileComponent
  ],
  imports: [
    CommonModule, 
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes)
  ],
//   exports: [
//     ProfileComponent
//   ]
})
export class ProfileModule { }
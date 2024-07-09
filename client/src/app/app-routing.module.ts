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

const routes: Routes = [
  { path: 'profile/:username', component: ProfileComponent },
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'blogs', component: BlogComponent },
  { path: 'blog/:id', component: ViewBlogComponent },
  { path: 'blogs/create', component: CreateBlogComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'forum/create', component: CreateForumComponent },
  { path: 'forum/:id', component: ViewForumComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

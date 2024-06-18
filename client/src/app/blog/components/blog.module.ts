import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BlogComponent } from './blog/blog.component';
import { CreateBlogComponent } from './createBlog/createBlog.component';
import { BlogService } from '../../shared/services/blog.service';
import { HttpClientModule } from '@angular/common/http';
import { ToolbarComponent } from '../../shared/modules/toolbar/toolbar.component';
import { NavbarComponent } from '../../shared/modules/navbar/navbar.component';
import { FooterComponent } from '../../shared/modules/footer/footer.component';


const routes: Routes = [
    { 
        path: 'blogs', 
        component: BlogComponent 
    },
    { 
        path: 'blog/:id', 
        component: BlogComponent 
    },
    { 
        path: 'blogs/create', 
        component: CreateBlogComponent 
        // canActivate: [AuthGuardService]
    },
];

@NgModule({
  declarations: [
    BlogComponent,
    CreateBlogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    ToolbarComponent,
    NavbarComponent,
    FooterComponent,
  ],
  providers: [BlogService]
})
export class BlogModule { }

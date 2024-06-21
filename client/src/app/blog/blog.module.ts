import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BlogComponent } from './components/blog/blog.component';
import { CreateBlogComponent } from './components/createBlog/createBlog.component';
import { BlogService } from '../shared/services/blog.service';
import { HttpClientModule } from '@angular/common/http';
import { ToolbarComponent } from '../shared/modules/toolbar/toolbar.component';
import { NavbarComponent } from '../shared/modules/navbar/navbar.component';
import { FooterComponent } from '../shared/modules/footer/footer.component';
import { BlogPreviewComponent } from '../shared/modules/blog-preview/blog-preview.component';
import { ViewBlogComponent } from './components/viewBlog/viewBlog.component';

const routes: Routes = [
    { 
        path: 'blogs', 
        component: BlogComponent 
    },
    { 
        path: 'blog/:id', 
        component: ViewBlogComponent
    },
    { 
        path: 'blogs/create', 
        component: CreateBlogComponent 
    },
];

@NgModule({
  declarations: [
    BlogComponent,
    CreateBlogComponent,
    ViewBlogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    ToolbarComponent,
    NavbarComponent,
    FooterComponent,
    BlogPreviewComponent
  ],
  providers: [BlogService]
})
export class BlogModule { }

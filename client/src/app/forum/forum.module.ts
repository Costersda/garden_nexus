import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ForumComponent } from './components/forum/forum.component';
import { CreateForumComponent } from './components/createForum/createForum.component';
import { ViewForumComponent } from './components/viewForum/viewForum.component';
import { HttpClientModule } from '@angular/common/http';
import { FooterComponent } from '../shared/modules/footer/footer.component';
import { NavbarComponent } from '../shared/modules/navbar/navbar.component';
import { ToolbarComponent } from '../shared/modules/toolbar/toolbar.component';
import { ForumService } from '../shared/services/forum.service';
import { ForumPreviewComponent } from '../shared/modules/forum-preview/forum-preview.component';

const routes: Routes = [
    { 
        path: 'forum', 
        component: ForumComponent 
    },
    { 
        path: 'forum/:id', 
        component: ViewForumComponent
    },
    { 
        path: 'forum/create', 
        component: CreateForumComponent 
    },
];

@NgModule({
    declarations: [
      ForumComponent,
      CreateForumComponent,
      ViewForumComponent
    ],
    imports: [
      CommonModule,
      FormsModule,
      HttpClientModule,
      RouterModule.forChild(routes),
      ToolbarComponent,
      NavbarComponent,
      FooterComponent,
      ForumPreviewComponent,
    ],
    providers: [ForumService]
  })
  export class ForumModule { }
  
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { ProfileModule } from './profile/profile.module';
import { AuthInterceptor } from './auth/services/authinterceptor.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ToolbarComponent } from './shared/modules/toolbar/toolbar.component';
import { NavbarComponent } from './shared/modules/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { BlogModule } from './blog/blog.module';
import { BlogPreviewComponent } from './shared/modules/blog-preview/blog-preview.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationDialogComponent } from './shared/modules/confirmation-dialog/confirmation-dialog.component';
import { ForumModule } from './forum/forum.module';
import { ForumPreviewComponent } from './shared/modules/forum-preview/forum-preview.component';
import { NotFoundComponent } from './404page/not-found.component';
import { HelpModule } from './help/help.module';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    ConfirmationDialogComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    HttpClientModule,
    HomeModule,
    ProfileModule,
    FormsModule,
    ToolbarComponent,
    NavbarComponent,
    BlogModule,
    BlogPreviewComponent,
    MatDialogModule,
    BrowserAnimationsModule,
    ForumModule,
    ForumPreviewComponent,
    HelpModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideAnimationsAsync('noop'),
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

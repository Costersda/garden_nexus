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
import { BlogModule } from './blog/components/blog.module';

@NgModule({
  declarations: [
    AppComponent
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
    BlogModule
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
export class AppModule {}

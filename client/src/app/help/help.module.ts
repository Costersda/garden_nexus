import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { ToolbarComponent } from '../shared/modules/toolbar/toolbar.component';
import { NavbarComponent } from '../shared/modules/navbar/navbar.component';
import { FooterComponent } from '../shared/modules/footer/footer.component';
import { HelpComponent } from './components/help.component';


const routes: Routes = [
  { 
    path: 'help', 
    component: HelpComponent,
  }
];

@NgModule({
  declarations: [
    HelpComponent,
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
  exports: [
    HelpComponent,
  ]
})
export class HelpModule { }

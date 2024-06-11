import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ToolbarComponent } from '../shared/toolbar/toolbar.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';



const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
]

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), ToolbarComponent, NavbarComponent, FooterComponent],
    declarations: [HomeComponent],
})

export class HomeModule {

}
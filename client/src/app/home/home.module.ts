import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ToolbarComponent } from '../shared/toolbar/toolbar.component';



const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
]

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), ToolbarComponent],
    declarations: [HomeComponent],
})

export class HomeModule {

}
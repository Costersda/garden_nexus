import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ToolbarComponent } from '../shared/modules/toolbar/toolbar.component';
import { NavbarComponent } from '../shared/modules/navbar/navbar.component';
import { FooterComponent } from '../shared/modules/footer/footer.component';
import { ImageSliderModule } from '../shared/modules/imageSlider/imageSlider.module';



const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
]

@NgModule({
    imports: [
        CommonModule, 
        RouterModule.forChild(routes), 
        ToolbarComponent, 
        NavbarComponent, 
        FooterComponent,
        ImageSliderModule,
    ],
    declarations: [HomeComponent],
})

export class HomeModule {

}
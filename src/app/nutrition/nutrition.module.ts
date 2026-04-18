import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NutritionPage } from './nutrition.page';
import { NutritionPageRoutingModule } from './nutrition-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NutritionPageRoutingModule,
    NutritionPage
  ]
})
export class NutritionPageModule {}

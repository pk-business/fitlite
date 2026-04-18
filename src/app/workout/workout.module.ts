import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutPage } from './workout.page';
import { WorkoutPageRoutingModule } from './workout-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    WorkoutPageRoutingModule,
    WorkoutPage
  ]
})
export class WorkoutPageModule {}

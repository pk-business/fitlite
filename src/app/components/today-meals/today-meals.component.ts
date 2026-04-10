import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DietDay } from '../../models';
import { PlanService } from '../../services/plan.service';

import { IonicModule } from '@ionic/angular';
import { MealCardComponent } from '../meal-card/meal-card.component';

/**
 * TodayMealsComponent displays today's meal plan
 * Smart component that fetches data from PlanService
 */
@Component({
    selector: 'app-today-meals',
    templateUrl: './today-meals.component.html',
    styleUrls: ['./today-meals.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonicModule, MealCardComponent]
})
export class TodayMealsComponent implements OnInit {
  todaysMeals: DietDay | null = null;
  isLoading = true;

  constructor(
    private planService: PlanService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadTodaysMeals();
  }

  /**
   * Load today's meals from service
   */
  async loadTodaysMeals(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      this.todaysMeals = await this.planService.getTodaysMeals();
    } catch (error) {
      console.error('Error loading today\'s meals:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Calculate total daily calories
   */
  get totalCalories(): number {
    if (!this.todaysMeals) return 0;
    return this.todaysMeals.meals.reduce((sum, meal) => sum + meal.calories, 0);
  }

  /**
   * Calculate total daily protein
   */
  get totalProtein(): number {
    if (!this.todaysMeals) return 0;
    return this.todaysMeals.meals.reduce((sum, meal) => sum + meal.protein, 0);
  }

  /**
   * Calculate total daily carbs
   */
  get totalCarbs(): number {
    if (!this.todaysMeals) return 0;
    return this.todaysMeals.meals.reduce((sum, meal) => sum + meal.carbs, 0);
  }

  /**
   * Calculate total daily fat
   */
  get totalFat(): number {
    if (!this.todaysMeals) return 0;
    return this.todaysMeals.meals.reduce((sum, meal) => sum + meal.fat, 0);
  }
}

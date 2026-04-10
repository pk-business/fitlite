import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DietPlan, DietDay } from '../models';
import { PlanService } from '../services/plan.service';
import { UserProfileService } from '../services/user-profile.service';
import { IonicModule } from '@ionic/angular';


/**
 * Tab3Page (Diet Plan) displays the weekly diet/meal schedule
 */
@Component({
    selector: 'app-tab3',
    templateUrl: 'tab3.page.html',
    styleUrls: ['tab3.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonicModule]
})
export class Tab3Page implements OnInit {
  dietPlan: DietPlan | null = null;
  isLoading = true;
  hasProfile = false;

  readonly dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private planService: PlanService,
    private userProfileService: UserProfileService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadDietPlan();
  }

  /**
   * Load weekly diet plan
   */
  async loadDietPlan(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      // Check if user has profile
      const profile = await this.userProfileService.loadProfile();
      this.hasProfile = profile !== null;

      if (this.hasProfile) {
        this.dietPlan = await this.planService.getDietPlan();
      }
    } catch (error) {
      console.error('Error loading diet plan:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Navigate to profile setup
   */
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  /**
   * Get day name for a diet day
   */
  getDayName(dayOfWeek: number): string {
    return this.dayNames[dayOfWeek];
  }

  /**
   * Calculate total calories for a day
   */
  getDailyCalories(day: DietDay): number {
    return day.meals.reduce((sum, meal) => sum + meal.calories, 0);
  }

  /**
   * Calculate total protein for a day
   */
  getDailyProtein(day: DietDay): number {
    return day.meals.reduce((sum, meal) => sum + meal.protein, 0);
  }

  /**
   * Calculate total carbs for a day
   */
  getDailyCarbs(day: DietDay): number {
    return day.meals.reduce((sum, meal) => sum + meal.carbs, 0);
  }

  /**
   * Calculate total fat for a day
   */
  getDailyFat(day: DietDay): number {
    return day.meals.reduce((sum, meal) => sum + meal.fat, 0);
  }

  /**
   * Check if a specific day is today
   */
  isToday(dayOfWeek: number): boolean {
    return new Date().getDay() === dayOfWeek;
  }

  /**
   * Get meal icon
   */
  getMealIcon(mealName: string): string {
    const name = mealName.toLowerCase();
    if (name.includes('breakfast')) return 'cafe-outline';
    if (name.includes('lunch')) return 'restaurant-outline';
    if (name.includes('dinner')) return 'pizza-outline';
    if (name.includes('snack')) return 'fast-food-outline';
    return 'nutrition-outline';
  }

  /**
   * Refresh data
   */
  async handleRefresh(event: any): Promise<void> {
    await this.loadDietPlan();
    event.target.complete();
  }
}

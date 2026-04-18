import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DietPlan, DietDay, UserProfile } from '../models';
import { DailyNutritionLog } from '../models/nutrition-tracking.model';
import { PlanService } from '../services/plan.service';
import { UserProfileService } from '../services/user-profile.service';
import { NutritionTrackingService } from '../services/nutrition-tracking.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { TodayMealsComponent } from '../components/today-meals/today-meals.component';
import { NutritionLoggerComponent } from '../nutrition-logger/nutrition-logger.component';
import { EditNutritionLogsComponent } from '../components/edit-nutrition-logs/edit-nutrition-logs.component';

/**
 * Tab3Page (Diet) – Today's nutrition + weekly diet plan
 */
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, TodayMealsComponent],
})
export class Tab3Page implements OnInit {
  dietPlan: DietPlan | null = null;
  userProfile: UserProfile | null = null;
  todaysNutrition: DailyNutritionLog | null = null;
  isLoading = true;
  hasProfile = false;

  readonly dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  constructor(
    private planService: PlanService,
    private userProfileService: UserProfileService,
    private nutritionTrackingService: NutritionTrackingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();
    try {
      this.userProfile = await this.userProfileService.loadProfile();
      this.hasProfile = !!this.userProfile;
      if (this.hasProfile) {
        this.dietPlan = await this.planService.getDietPlan();
        await this.nutritionTrackingService.loadLogs();
        this.todaysNutrition = this.nutritionTrackingService.getLogForDate(
          new Date().toISOString().split('T')[0],
        );
      }
    } catch (error) {
      console.error('Error loading diet data:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  getDayName(dayOfWeek: number): string {
    return this.dayNames[dayOfWeek];
  }

  getDailyCalories(day: DietDay): number {
    return day.meals.reduce((s, m) => s + m.calories, 0);
  }
  getDailyProtein(day: DietDay): number {
    return day.meals.reduce((s, m) => s + m.protein, 0);
  }
  getDailyCarbs(day: DietDay): number {
    return day.meals.reduce((s, m) => s + m.carbs, 0);
  }
  getDailyFat(day: DietDay): number {
    return day.meals.reduce((s, m) => s + m.fat, 0);
  }

  isToday(dayOfWeek: number): boolean {
    return new Date().getDay() === dayOfWeek;
  }

  getMealIcon(mealName: string): string {
    const name = mealName.toLowerCase();
    if (name.includes('breakfast')) return 'cafe-outline';
    if (name.includes('lunch')) return 'restaurant-outline';
    if (name.includes('dinner')) return 'pizza-outline';
    if (name.includes('snack')) return 'fast-food-outline';
    return 'nutrition-outline';
  }

  async handleRefresh(event: any): Promise<void> {
    await this.loadData();
    event.target.complete();
  }

  // Nutrition calc helpers
  getCalorieProgress(): number {
    if (!this.userProfile?.recommendedCalories) return 0;
    return Math.min(
      ((this.todaysNutrition?.caloriesConsumed || 0) /
        this.userProfile.recommendedCalories) *
        100,
      100,
    );
  }
  getRemainingCalories(): number {
    return Math.max(
      (this.userProfile?.recommendedCalories || 0) -
        (this.todaysNutrition?.caloriesConsumed || 0),
      0,
    );
  }
  getProteinProgress(): number {
    if (!this.userProfile?.recommendedProtein) return 0;
    return Math.min(
      ((this.todaysNutrition?.proteinConsumed || 0) /
        this.userProfile.recommendedProtein) *
        100,
      100,
    );
  }
  getRemainingProtein(): number {
    return Math.max(
      (this.userProfile?.recommendedProtein || 0) -
        (this.todaysNutrition?.proteinConsumed || 0),
      0,
    );
  }
  getCarbsProgress(): number {
    if (!this.userProfile?.recommendedCarbs) return 0;
    return Math.min(
      ((this.todaysNutrition?.carbsConsumed || 0) /
        this.userProfile.recommendedCarbs) *
        100,
      100,
    );
  }
  getRemainingCarbs(): number {
    return Math.max(
      (this.userProfile?.recommendedCarbs || 0) -
        (this.todaysNutrition?.carbsConsumed || 0),
      0,
    );
  }
  getFatProgress(): number {
    if (!this.userProfile?.recommendedFat) return 0;
    return Math.min(
      ((this.todaysNutrition?.fatConsumed || 0) /
        this.userProfile.recommendedFat) *
        100,
      100,
    );
  }
  getRemainingFat(): number {
    return Math.max(
      (this.userProfile?.recommendedFat || 0) -
        (this.todaysNutrition?.fatConsumed || 0),
      0,
    );
  }

  async openNutritionLogger(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: NutritionLoggerComponent,
      componentProps: { date: new Date().toISOString().split('T')[0] },
    });
    await modal.present();
    modal.onDidDismiss().then(() => this.loadData());
  }

  async openEditNutritionLogs(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: EditNutritionLogsComponent,
    });
    await modal.present();
    modal.onDidDismiss().then(() => this.loadData());
  }
}

import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { UserProfile } from '../models';
import { DailyNutritionLog } from '../models/nutrition-tracking.model';
import { UserProfileService } from '../services/user-profile.service';
import { PlanService } from '../services/plan.service';
import { NutritionTrackingService } from '../services/nutrition-tracking.service';
import { IonicModule } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { TodayWorkoutComponent } from '../components/today-workout/today-workout.component';
import { TodayMealsComponent } from '../components/today-meals/today-meals.component';
import { RestTimerComponent } from '../components/rest-timer/rest-timer.component';
import { NutritionLoggerComponent } from '../nutrition-logger/nutrition-logger.component';
import { EditNutritionLogsComponent } from '../components/edit-nutrition-logs/edit-nutrition-logs.component';

/**
 * Tab1Page (Home) displays today's workout and meals
 * Provides a quick overview of the daily plan
 */
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonicModule,
    RouterLink,
    TodayWorkoutComponent,
    TodayMealsComponent,
    RestTimerComponent,
    DatePipe,
  ],
})
export class Tab1Page implements OnInit {
  userProfile: UserProfile | null = null;
  todaysNutrition: DailyNutritionLog | null = null;
  currentDate: Date = new Date();
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
    private userProfileService: UserProfileService,
    private planService: PlanService,
    private nutritionTrackingService: NutritionTrackingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  /**
   * Load user profile
   */
  async loadData(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      // Check if user has profile
      this.userProfile = await this.userProfileService.loadProfile();

      // If profile exists, check if workout plan exists and generate if needed
      if (this.userProfile) {
        this.hasProfile = true;
        const existingPlan = await this.planService.getWorkoutPlan();
        if (!existingPlan) {
          console.log('No workout plan found, generating plan...');
          await this.planService.generateAllPlans(this.userProfile);
        }
        // Load today's nutrition log
        this.todaysNutrition = this.nutritionTrackingService.getLogForDate(
          new Date().toISOString().split('T')[0]
        );
      } else {
        this.hasProfile = false;
        this.todaysNutrition = null;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.hasProfile = false;
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
   * Refresh data
   */
  async handleRefresh(event: any): Promise<void> {
    await this.loadData();
    event.target.complete();
  }

  /**
   * Get today's day name
   */
  get todayName(): string {
    return this.dayNames[this.currentDate.getDay()];
  }

  /**
   * Get greeting based on time of day with user name if available
   */
  get greeting(): string {
    const hour = this.currentDate.getHours();
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good Morning';
    else if (hour < 18) timeGreeting = 'Good Afternoon';
    else timeGreeting = 'Good Evening';

    if (this.userProfile?.name) {
      return `${timeGreeting}, ${this.userProfile.name}`;
    }
    return timeGreeting;
  }

  /**
   * Open nutrition logger modal
   */
  async openNutritionLogger(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: NutritionLoggerComponent,
      componentProps: {
        date: new Date().toISOString().split('T')[0],
      },
    });
    const result = await modal.present();
    // Refresh data after modal closes
    modal.onDidDismiss().then(() => {
      this.loadData();
    });
  }

  /**
   * Get calorie progress percentage
   */
  getCalorieProgress(): number {
    if (!this.userProfile?.recommendedCalories) return 0;
    const consumed = this.todaysNutrition?.caloriesConsumed || 0;
    return Math.min((consumed / this.userProfile.recommendedCalories) * 100, 100);
  }

  /**
   * Get remaining calories
   */
  getRemainingCalories(): number {
    if (!this.userProfile?.recommendedCalories) return 0;
    const consumed = this.todaysNutrition?.caloriesConsumed || 0;
    return Math.max(this.userProfile.recommendedCalories - consumed, 0);
  }

  /**
   * Get protein progress percentage
   */
  getProteinProgress(): number {
    if (!this.userProfile?.recommendedProtein) return 0;
    const consumed = this.todaysNutrition?.proteinConsumed || 0;
    return Math.min((consumed / this.userProfile.recommendedProtein) * 100, 100);
  }

  /**
   * Get remaining protein
   */
  getRemainingProtein(): number {
    if (!this.userProfile?.recommendedProtein) return 0;
    const consumed = this.todaysNutrition?.proteinConsumed || 0;
    return Math.max(this.userProfile.recommendedProtein - consumed, 0);
  }

  /**
   * Get carbs progress percentage
   */
  getCarbsProgress(): number {
    if (!this.userProfile?.recommendedCarbs) return 0;
    const consumed = this.todaysNutrition?.carbsConsumed || 0;
    return Math.min((consumed / this.userProfile.recommendedCarbs) * 100, 100);
  }

  /**
   * Get remaining carbs
   */
  getRemainingCarbs(): number {
    if (!this.userProfile?.recommendedCarbs) return 0;
    const consumed = this.todaysNutrition?.carbsConsumed || 0;
    return Math.max(this.userProfile.recommendedCarbs - consumed, 0);
  }

  /**
   * Get fat progress percentage
   */
  getFatProgress(): number {
    if (!this.userProfile?.recommendedFat) return 0;
    const consumed = this.todaysNutrition?.fatConsumed || 0;
    return Math.min((consumed / this.userProfile.recommendedFat) * 100, 100);
  }

  /**
   * Open edit nutrition logs modal (last 5 logs)
   */
  async openEditNutritionLogs(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: EditNutritionLogsComponent,
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      this.loadData();
    });
  }

  /**
   * Get remaining fat
   */
  getRemainingFat(): number {
    if (!this.userProfile?.recommendedFat) return 0;
    const consumed = this.todaysNutrition?.fatConsumed || 0;
    return Math.max(this.userProfile.recommendedFat - consumed, 0);
  }
}

import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserProfile } from '../models';
import { UserProfileService } from '../services/user-profile.service';
import { PlanService } from '../services/plan.service';
import { IonicModule } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { TodayWorkoutComponent } from '../components/today-workout/today-workout.component';
import { TodayMealsComponent } from '../components/today-meals/today-meals.component';

/**
 * Tab1Page (Home) displays today's workout and meals
 * Provides a quick overview of the daily plan
 */
@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonicModule, RouterLink, TodayWorkoutComponent, TodayMealsComponent, DatePipe]
})
export class Tab1Page implements OnInit {
  userProfile: UserProfile | null = null;
  currentDate: Date = new Date();
  isLoading = true;
  hasProfile = false;

  readonly dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private userProfileService: UserProfileService,
    private planService: PlanService,
    private router: Router,
    private cdr: ChangeDetectorRef
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
      } else {
        this.hasProfile = false;
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
}

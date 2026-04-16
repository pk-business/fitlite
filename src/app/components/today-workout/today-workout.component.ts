import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutDay } from '../../models';
import { PlanService } from '../../services/plan.service';
import { ScheduleService } from '../../services/schedule.service';

import { IonicModule } from '@ionic/angular';
import { EnhancedWorkoutCardComponent } from '../enhanced-workout-card/enhanced-workout-card.component';

/**
 * TodayWorkoutComponent displays today's workout with enhanced UI
 * Smart component that fetches data from PlanService
 */
@Component({
    selector: 'app-today-workout',
    templateUrl: './today-workout.component.html',
    styleUrls: ['./today-workout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, IonicModule, EnhancedWorkoutCardComponent]
})
export class TodayWorkoutComponent implements OnInit {
  todaysWorkout: WorkoutDay | null = null;
  isLoading = true;
  currentDay: number;
  useMetric = false;

  constructor(
    private planService: PlanService,
    private scheduleService: ScheduleService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.currentDay = new Date().getDay();
  }

  async ngOnInit() {
    await this.loadTodaysWorkout();
    await this.loadSettings();
  }

  ionViewWillEnter() {
    this.loadTodaysWorkout();
  }

  /**
   * Load settings to get metric preference
   */
  async loadSettings(): Promise<void> {
    try {
      const settings = await this.scheduleService.getSettings();
      this.useMetric = settings.useMetricUnits;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Load today's workout from service
   */
  async loadTodaysWorkout(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      this.todaysWorkout = await this.planService.getTodaysWorkout();
    } catch (error) {
      console.error('Error loading today\'s workout:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Check if today is a rest day
   */
  get isRestDay(): boolean {
    return !this.todaysWorkout;
  }

  /**
   * Get day name
   */
  get dayName(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[this.currentDay];
  }

  /**
   * Get formatted focus display name
   */
  get focusDisplayName(): string {
    if (!this.todaysWorkout?.focus) return '';
    
    const focus = this.todaysWorkout.focus;
    const focusMap: { [key: string]: string } = {
      'full': 'Full Body',
      'upper': 'Upper Body',
      'lower': 'Lower Body',
      'cardio': 'Cardio'
    };
    
    return focusMap[focus] || focus;
  }

  /**
   * Navigate to workout builder for today
   */
  editWorkout(): void {
    this.router.navigate(['/workout-builder'], {
      queryParams: { day: this.currentDay }
    });
  }
}

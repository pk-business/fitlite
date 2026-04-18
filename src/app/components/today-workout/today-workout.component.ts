import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WorkoutDay } from '../../models';
import { PlanService } from '../../services/plan.service';
import { ScheduleService } from '../../services/schedule.service';

import { IonicModule } from '@ionic/angular';
import { EnhancedWorkoutCardComponent } from '../enhanced-workout-card/enhanced-workout-card.component';

/**
 * TodayWorkoutComponent displays today's workout with enhanced UI
 * Smart component that subscribes reactively to PlanService.workoutPlan$
 */
@Component({
  selector: 'app-today-workout',
  templateUrl: './today-workout.component.html',
  styleUrls: ['./today-workout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, EnhancedWorkoutCardComponent],
})
export class TodayWorkoutComponent implements OnInit, OnDestroy {
  todaysWorkout: WorkoutDay | null = null;
  isLoading = true;
  currentDay: number;
  useMetric = false;

  private destroy$ = new Subject<void>();

  constructor(
    private planService: PlanService,
    private scheduleService: ScheduleService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.currentDay = new Date().getDay();
  }

  async ngOnInit() {
    await this.loadSettings();

    // Subscribe reactively to workout plan changes
    // This ensures the component updates when exercises are added/deleted
    this.planService.workoutPlan$
      .pipe(takeUntil(this.destroy$))
      .subscribe((plan) => {
        if (plan) {
          this.todaysWorkout =
            plan.weeklyPlan.find((day) => day.dayOfWeek === this.currentDay) ||
            null;
        } else {
          this.todaysWorkout = null;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
   * Check if today is a rest day
   */
  get isRestDay(): boolean {
    return !this.todaysWorkout;
  }

  /**
   * Get day name
   */
  get dayName(): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[this.currentDay];
  }

  /**
   * Get formatted focus display name
   */
  get focusDisplayName(): string {
    if (!this.todaysWorkout?.focus) return '';

    const focus = this.todaysWorkout.focus;
    const focusMap: { [key: string]: string } = {
      full: 'Full Body',
      upper: 'Upper Body',
      lower: 'Lower Body',
      cardio: 'Cardio',
    };

    return focusMap[focus] || focus;
  }

  /**
   * Navigate to workout builder for today
   */
  editWorkout(): void {
    this.router.navigate(['/workout-builder'], {
      queryParams: { day: this.currentDay },
    });
  }
}

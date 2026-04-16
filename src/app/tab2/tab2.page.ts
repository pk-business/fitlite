import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutPlan, WorkoutDay, Exercise } from '../models';
import { PlanService } from '../services/plan.service';
import { UserProfileService } from '../services/user-profile.service';
import { ExerciseLogService } from '../services/exercise-log.service';
import { ScheduleService } from '../services/schedule.service';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ExerciseLogModal } from '../components/exercise-log-modal/exercise-log-modal.component';

/**
 * Tab2Page (Workout Plan) displays the weekly workout schedule
 */
@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonicModule, CommonModule]
})
export class Tab2Page implements OnInit {
  workoutPlan: WorkoutPlan | null = null;
  isLoading = true;
  hasProfile = false;
  useMetric = false;

  readonly dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private planService: PlanService,
    private userProfileService: UserProfileService,
    private exerciseLogService: ExerciseLogService,
    private scheduleService: ScheduleService,
    private router: Router,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadWorkoutPlan();
    await this.loadSettings();
  }

  ionViewWillEnter() {
    this.loadWorkoutPlan();
  }

  async loadSettings(): Promise<void> {
    try {
      const settings = await this.scheduleService.getSettings();
      this.useMetric = settings.useMetricUnits;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Load weekly workout plan
   */
  async loadWorkoutPlan(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      // Check if user has profile
      const profile = await this.userProfileService.loadProfile();
      this.hasProfile = profile !== null;

      if (this.hasProfile) {
        this.workoutPlan = await this.planService.getWorkoutPlan();
      }
    } catch (error) {
      console.error('Error loading workout plan:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Get days not yet in the plan
   */
  get availableDays(): { value: number; label: string }[] {
    const used = new Set((this.workoutPlan?.weeklyPlan || []).map(d => d.dayOfWeek));
    return this.dayNames
      .map((label, value) => ({ value, label }))
      .filter(d => !used.has(d.value));
  }

  /**
   * Show alert to pick day + focus, then add it
   */
  async promptAddDay(): Promise<void> {
    const dayInputs = this.availableDays.map(d => ({
      type: 'radio' as const,
      label: d.label,
      value: d.value,
      checked: false
    }));

    const dayAlert = await this.alertCtrl.create({
      header: 'Select Day',
      inputs: dayInputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Next',
          handler: (dayOfWeek: number) => {
            this.promptFocus(dayOfWeek);
          }
        }
      ]
    });
    await dayAlert.present();
  }

  async promptFocus(dayOfWeek: number): Promise<void> {
    const focusAlert = await this.alertCtrl.create({
      header: 'Select Focus',
      inputs: [
        { type: 'radio', label: 'Full Body', value: 'full', checked: true },
        { type: 'radio', label: 'Upper Body', value: 'upper' },
        { type: 'radio', label: 'Lower Body', value: 'lower' },
        { type: 'radio', label: 'Cardio', value: 'cardio' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (focus: 'full' | 'upper' | 'lower' | 'cardio') => {
            await this.addWorkoutDay(dayOfWeek, focus);
          }
        }
      ]
    });
    await focusAlert.present();
  }

  async addWorkoutDay(dayOfWeek: number, focus: 'full' | 'upper' | 'lower' | 'cardio'): Promise<void> {
    const newDay: WorkoutDay = { dayOfWeek, focus, exercises: [] };
    await this.planService.updateWorkoutDay(dayOfWeek, newDay);
    await this.loadWorkoutPlan();
    // Navigate to builder so user can add exercises immediately
    this.router.navigate(['/workout-builder'], { queryParams: { day: dayOfWeek } });
  }

  /**
   * Navigate to profile setup
   */
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  /**
   * Get day name for a workout day
   */
  getDayName(dayOfWeek: number): string {
    return this.dayNames[dayOfWeek];
  }

  /**
   * Get focus icon for workout type
   */
  getFocusIcon(focus: string): string {
    const icons: { [key: string]: string } = {
      full: 'body-outline',
      upper: 'hand-left-outline',
      lower: 'walk-outline',
      cardio: 'heart-outline'
    };
    return icons[focus] || 'barbell-outline';
  }

  /**
   * Get focus color for workout type
   */
  getFocusColor(focus: string): string {
    const colors: { [key: string]: string } = {
      full: 'primary',
      upper: 'secondary',
      lower: 'tertiary',
      cardio: 'danger'
    };
    return colors[focus] || 'medium';
  }

  /**
   * Check if a specific day is today
   */
  isToday(dayOfWeek: number): boolean {
    return new Date().getDay() === dayOfWeek;
  }

  /**
   * Navigate to workout builder for a specific day
   */
  editWorkout(dayOfWeek: number): void {
    this.router.navigate(['/workout-builder'], {
      queryParams: { day: dayOfWeek }
    });
  }

  /**
   * Refresh data
   */
  async handleRefresh(event: any): Promise<void> {
    await this.loadWorkoutPlan();
    event.target.complete();
  }

  /**
   * Open exercise log modal
   */
  async openLogModal(exercise: Exercise): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExerciseLogModal,
      componentProps: {
        exercise,
        date: new Date().toISOString().split('T')[0],
        useMetric: this.useMetric
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.saved) {
      // Refresh to update log indicators
      this.cdr.markForCheck();
    }
  }

  /**
   * Check if exercise has been logged today
   */
  isExerciseLogged(exerciseName: string): boolean {
    return this.exerciseLogService.isLoggedToday(exerciseName);
  }

  /**
   * Get previous log for an exercise (shows most recent log)
   */
  getPreviousLog(exerciseName: string): string {
    const today = new Date().toISOString().split('T')[0];
    const lastLog = this.exerciseLogService.getLastLogForExercise(exerciseName);
    
    if (!lastLog) {
      return '';
    }
    
    // Format: "20kg×12, 20kg×10, 20kg×8"
    const unit = this.useMetric ? 'kg' : 'lbs';
    const setsStr = lastLog.sets
      .map(set => `${set.weight || 0}${unit}×${set.reps}`)
      .join(', ');
    
    const prefix = lastLog.date === today ? 'Today' : 'Last';
    return `${prefix}: ${setsStr}`;
  }
}

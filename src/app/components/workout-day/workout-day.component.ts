import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { WorkoutDay, Exercise } from '../../models';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ExerciseLogService } from '../../services/exercise-log.service';
import { ScheduleService } from '../../services/schedule.service';
import { ExerciseLogModal } from '../exercise-log-modal/exercise-log-modal.component';

/**
 * WorkoutDayComponent displays a single workout day with exercises
 * Reusable component with OnPush for optimal performance
 */
@Component({
    selector: 'app-workout-day',
    templateUrl: './workout-day.component.html',
    styleUrls: ['./workout-day.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonicModule, CommonModule]
})
export class WorkoutDayComponent {
  @Input() workoutDay!: WorkoutDay;
  @Input() dayName?: string;
  @Input() showDayName = true;
  @Input() isToday = false;
  useMetric = false;

  constructor(
    private modalCtrl: ModalController,
    private exerciseLogService: ExerciseLogService,
    private scheduleService: ScheduleService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadSettings();
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
   * Get focus icon based on workout type
   */
  get focusIcon(): string {
    const icons: { [key: string]: string } = {
      full: 'body-outline',
      upper: 'hand-left-outline',
      lower: 'walk-outline',
      cardio: 'heart-outline'
    };
    return icons[this.workoutDay.focus] || 'barbell-outline';
  }

  /**
   * Get focus color based on workout type
   */
  get focusColor(): string {
    const colors: { [key: string]: string } = {
      full: 'primary',
      upper: 'secondary',
      lower: 'tertiary',
      cardio: 'danger'
    };
    return colors[this.workoutDay.focus] || 'medium';
  }

  /**
   * Get readable day name from day number
   */
  get displayDayName(): string {
    if (this.dayName) return this.dayName;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[this.workoutDay.dayOfWeek] || '';
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
      // Refresh the component to update log indicators
      this.cdr.markForCheck();
    }
  }

  /**
   * Check if exercise has been logged today
   */
  isExerciseLogged(exerciseName: string): boolean {
    return this.exerciseLogService.isLoggedToday(exerciseName);
  }
}

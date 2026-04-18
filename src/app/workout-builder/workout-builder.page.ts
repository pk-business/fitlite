import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, AlertController, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { WorkoutDay, Exercise } from '../models';
import { PlanService } from '../services/plan.service';
import { ExerciseLibraryService } from '../services/exercise-library.service';
import { ExerciseLogService } from '../services/exercise-log.service';
import { ScheduleService } from '../services/schedule.service';
import { ExerciseSelectorModal } from './exercise-selector-modal/exercise-selector-modal.component';
import { ExerciseLogModal } from '../components/exercise-log-modal/exercise-log-modal.component';
import { MuscleGroup } from '../models/exercise-library.model';

/**
 * WorkoutBuilderPage allows users to edit their weekly workout plan
 * Add, remove, reorder exercises for each day
 */
@Component({
  selector: 'app-workout-builder',
  templateUrl: './workout-builder.page.html',
  styleUrls: ['./workout-builder.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class WorkoutBuilderPage implements OnInit {
  workoutDay: WorkoutDay | null = null;
  dayOfWeek: number = 1;
  isLoading = true;
  isEditingExercise = false;
  editingIndex: number | null = null;
  useMetric = false;

  readonly dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  readonly focusOptions: Array<{
    value: 'full' | 'upper' | 'lower' | 'cardio';
    label: string;
    icon: string;
  }> = [
    { value: 'full', label: 'Full Body', icon: 'barbell-outline' },
    { value: 'upper', label: 'Upper Body', icon: 'fitness-outline' },
    { value: 'lower', label: 'Lower Body', icon: 'walk-outline' },
    { value: 'cardio', label: 'Cardio', icon: 'heart-outline' },
  ];

  constructor(
    private planService: PlanService,
    private exerciseLibraryService: ExerciseLibraryService,
    private exerciseLogService: ExerciseLogService,
    private scheduleService: ScheduleService,
    private router: Router,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
  ) {}

  async ngOnInit() {
    // Get day from route params
    this.route.queryParams.subscribe(async (params) => {
      if (params['day']) {
        this.dayOfWeek = parseInt(params['day'], 10);
      }
      await this.loadWorkoutDay();
    });
    await this.loadSettings();
  }

  /**
   * Load settings to get metric preference
   */
  async loadSettings(): Promise<void> {
    try {
      const settings = await this.scheduleService.getSettings();
      this.useMetric = settings.useMetricUnits;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Load workout for the specified day
   */
  async loadWorkoutDay(): Promise<void> {
    this.isLoading = true;
    try {
      this.workoutDay = await this.planService.getWorkoutForDay(this.dayOfWeek);

      // If no workout exists for this day, create a default one
      if (!this.workoutDay) {
        this.workoutDay = {
          dayOfWeek: this.dayOfWeek,
          focus: 'full',
          exercises: [],
        };
      }
    } catch (error) {
      console.error('Error loading workout day:', error);
      await this.showToast('Error loading workout', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get day name
   */
  get dayName(): string {
    return this.dayNames[this.dayOfWeek];
  }

  /**
   * Change workout focus
   */
  async changeFocus(
    focus: 'full' | 'upper' | 'lower' | 'cardio',
  ): Promise<void> {
    if (this.workoutDay) {
      this.workoutDay.focus = focus;
      await this.saveWorkout();
    }
  }

  /**
   * Open exercise selector modal
   */
  async addExercise(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExerciseSelectorModal,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.exercise && this.workoutDay) {
      // Convert LibraryExercise → Exercise shape used by the workout plan
      const exercise: Exercise = {
        name: data.exercise.name,
        sets: 3,
        reps: 12,
        restSeconds: 60,
        category: this.workoutDay.focus,
      };
      this.workoutDay.exercises.push(exercise);
      await this.saveWorkout();
      await this.showToast(`${exercise.name} added to workout`, 'success');
    }
  }

  /**
   * Show prompt to create new exercise inline
   */
  async showCreateExercisePrompt(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Create New Exercise',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Exercise name',
          attributes: {
            required: true,
          },
        },
        {
          name: 'sets',
          type: 'number',
          placeholder: 'Sets',
          value: 3,
          min: 1,
          max: 10,
        },
        {
          name: 'reps',
          type: 'number',
          placeholder: 'Reps',
          value: 12,
          min: 1,
          max: 100,
        },
        {
          name: 'restSeconds',
          type: 'number',
          placeholder: 'Rest (seconds)',
          value: 60,
          min: 10,
          max: 300,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Create & Add',
          handler: async (data) => {
            if (!data.name || data.name.trim() === '') {
              this.showToast('Exercise name is required', 'danger');
              return false;
            }

            try {
              // Map workout focus to muscle group for the library
              const muscleMap: Record<string, MuscleGroup> = {
                full: 'Core',
                upper: 'Chest',
                lower: 'Legs',
                cardio: 'Core',
                custom: 'Custom',
              };
              const primaryMuscle = muscleMap[this.workoutDay?.focus || 'full'];

              // Create new custom exercise in the library
              const newExercise =
                await this.exerciseLibraryService.addQuickCustomExercise(
                  data.name.trim(),
                  primaryMuscle,
                  ['Bodyweight'],
                );

              // Add to current workout with the specified volume
              if (this.workoutDay) {
                const exercise: Exercise = {
                  name: newExercise.name,
                  sets: parseInt(data.sets) || 3,
                  reps: parseInt(data.reps) || 12,
                  restSeconds: parseInt(data.restSeconds) || 60,
                  category: this.workoutDay.focus,
                };
                this.workoutDay.exercises.push(exercise);
                await this.saveWorkout();
                await this.showToast('Exercise created and added', 'success');
              }
              return true;
            } catch (error) {
              console.error('Error creating exercise:', error);
              this.showToast('Failed to create exercise', 'danger');
              return false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Edit an exercise
   */
  async editExercise(index: number): Promise<void> {
    const exercise = this.workoutDay?.exercises[index];
    if (!exercise) return;

    const alert = await this.alertCtrl.create({
      header: 'Edit Exercise',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Exercise name',
          value: exercise.name,
        },
        {
          name: 'sets',
          type: 'number',
          placeholder: 'Sets',
          value: exercise.sets,
          min: 1,
          max: 10,
        },
        {
          name: 'reps',
          type: 'number',
          placeholder: 'Reps',
          value: exercise.reps,
          min: 1,
          max: 100,
        },
        {
          name: 'restSeconds',
          type: 'number',
          placeholder: 'Rest (seconds)',
          value: exercise.restSeconds,
          min: 10,
          max: 300,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: async (data) => {
            if (this.workoutDay && data.name) {
              const updatedExercise: Exercise = {
                name: data.name,
                sets: parseInt(data.sets) || 3,
                reps: parseInt(data.reps) || 12,
                restSeconds: parseInt(data.restSeconds) || 60,
                category: exercise.category,
              };

              this.workoutDay.exercises[index] = updatedExercise;
              await this.saveWorkout();
              await this.showToast('Exercise updated', 'success');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Remove an exercise
   */
  async removeExercise(index: number): Promise<void> {
    const exercise = this.workoutDay?.exercises[index];
    if (!exercise) return;

    const alert = await this.alertCtrl.create({
      header: 'Remove Exercise',
      message: `Remove "${exercise.name}" from this workout?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: async () => {
            if (this.workoutDay) {
              this.workoutDay.exercises.splice(index, 1);
              await this.saveWorkout();
              await this.showToast('Exercise removed', 'success');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Move exercise up
   */
  async moveUp(index: number): Promise<void> {
    if (index > 0 && this.workoutDay) {
      const temp = this.workoutDay.exercises[index];
      this.workoutDay.exercises[index] = this.workoutDay.exercises[index - 1];
      this.workoutDay.exercises[index - 1] = temp;
      await this.saveWorkout();
    }
  }

  /**
   * Move exercise down
   */
  async moveDown(index: number): Promise<void> {
    if (this.workoutDay && index < this.workoutDay.exercises.length - 1) {
      const temp = this.workoutDay.exercises[index];
      this.workoutDay.exercises[index] = this.workoutDay.exercises[index + 1];
      this.workoutDay.exercises[index + 1] = temp;
      await this.saveWorkout();
    }
  }

  /**
   * Save the workout
   */
  async saveWorkout(): Promise<void> {
    if (!this.workoutDay) return;

    try {
      await this.planService.updateWorkoutDay(this.dayOfWeek, this.workoutDay);
    } catch (error) {
      console.error('Error saving workout:', error);
      await this.showToast('Error saving workout', 'danger');
    }
  }

  /**
   * Delete this workout day
   */
  async deleteWorkout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete Workout',
      message: `Delete the workout for ${this.dayName}? This will make it a rest day.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.planService.deleteWorkoutDay(this.dayOfWeek);
              await this.showToast('Workout deleted', 'success');
              this.router.navigate(['/tabs/exercise']);
            } catch (error) {
              console.error('Error deleting workout:', error);
              await this.showToast('Error deleting workout', 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Get focus icon
   */
  getFocusIcon(focus: string): string {
    const option = this.focusOptions.find((o) => o.value === focus);
    return option ? option.icon : 'barbell-outline';
  }

  /**
   * Get focus label
   */
  getFocusLabel(focus: string): string {
    const option = this.focusOptions.find((o) => o.value === focus);
    return option ? option.label : focus;
  }

  /**
   * Get total sets in workout
   */
  getTotalSets(): number {
    if (!this.workoutDay) return 0;
    return this.workoutDay.exercises.reduce((total, ex) => total + ex.sets, 0);
  }

  /**
   * Get estimated workout time
   */
  getEstimatedTime(): number {
    if (!this.workoutDay) return 0;

    // Calculate time: (sets × reps × 3 seconds per rep) + rest time
    const totalTime = this.workoutDay.exercises.reduce((total, ex) => {
      const exerciseTime = ex.sets * ex.reps * 3 + ex.sets * ex.restSeconds;
      return total + exerciseTime;
    }, 0);

    return Math.round(totalTime / 60); // Convert to minutes
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  /**
   * Navigate back
   */
  goBack(): void {
    this.router.navigate(['/tabs/exercise']);
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
        useMetric: this.useMetric,
      },
    });

    await modal.present();
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
      .map((set) => `${set.weight || 0}${unit}×${set.reps}`)
      .join(', ');

    const prefix = lastLog.date === today ? 'Today' : 'Last';
    return `${prefix}: ${setsStr}`;
  }
}

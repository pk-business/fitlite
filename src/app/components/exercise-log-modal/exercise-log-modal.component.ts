import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseLog, SetLog, Exercise } from '../../models';
import { isCardioExercise } from '../../models/exercise-log.model';
import { ExerciseLogService } from '../../services/exercise-log.service';

/**
 * ExerciseLogModal allows users to log their actual workout performance
 * Track weights, reps, and notes for each exercise
 */
@Component({
  selector: 'app-exercise-log-modal',
  templateUrl: './exercise-log-modal.component.html',
  styleUrls: ['./exercise-log-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ExerciseLogModal implements OnInit {
  @Input() exercise!: Exercise;
  @Input() date: string = new Date().toISOString().split('T')[0];
  @Input() useMetric: boolean = false;

  sets: SetLog[] = [];
  notes: string = '';
  existingLog: ExerciseLog | null = null;
  previousLog: ExerciseLog | null = null;
  isLoading = false;
  /** User can manually override auto-detected cardio mode */
  forceStrength = false;

  get isCardio(): boolean {
    if (this.forceStrength) return false;
    return isCardioExercise(this.exercise?.name || '', this.exercise?.category);
  }

  constructor(
    private modalCtrl: ModalController,
    private exerciseLogService: ExerciseLogService,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    this.loadPreviousLog();
    this.loadExistingLog();
  }

  /**
   * Load previous workout data (not today)
   */
  loadPreviousLog(): void {
    const lastLog = this.exerciseLogService.getLastLogForExercise(
      this.exercise.name,
    );
    // Only set if it's not today's log
    if (lastLog && lastLog.date !== this.date) {
      this.previousLog = lastLog;
    }
  }

  /**
   * Load existing log for this exercise and date if it exists
   */
  loadExistingLog(): void {
    const logs = this.exerciseLogService.getLogsForDate(this.date);
    this.existingLog =
      logs.find(
        (log) =>
          log.exerciseName.toLowerCase() === this.exercise.name.toLowerCase(),
      ) || null;

    if (this.existingLog) {
      // Load existing data
      this.sets = [...this.existingLog.sets];
      this.notes = this.existingLog.notes || '';
    } else {
      // Initialize with planned sets
      this.initializeSets();
    }
  }

  /**
   * Initialize sets based on exercise plan
   */
  initializeSets(): void {
    this.sets = [];
    const count = this.exercise.sets || 1;
    for (let i = 0; i < count; i++) {
      if (this.isCardio) {
        this.sets.push({
          setNumber: i + 1,
          reps: 0,
          completed: false,
          durationMinutes: 20,
          distanceKm: undefined,
          intensity: 'moderate',
        });
      } else {
        this.sets.push({
          setNumber: i + 1,
          reps: this.exercise.reps,
          weight: 0,
          completed: false,
        });
      }
    }
  }

  /**
   * Add a new set
   */
  addSet(): void {
    const last = this.sets.length > 0 ? this.sets[this.sets.length - 1] : null;
    if (this.isCardio) {
      this.sets.push({
        setNumber: this.sets.length + 1,
        reps: 0,
        completed: false,
        durationMinutes: last?.durationMinutes ?? 20,
        distanceKm: last?.distanceKm,
        intensity: last?.intensity ?? 'moderate',
      });
    } else {
      this.sets.push({
        setNumber: this.sets.length + 1,
        reps: this.exercise.reps,
        weight: last?.weight ?? 0,
        completed: false,
      });
    }
  }

  /**
   * Remove a set
   */
  removeSet(index: number): void {
    if (this.sets.length > 1) {
      this.sets.splice(index, 1);
      // Renumber sets
      this.sets.forEach((set, i) => (set.setNumber = i + 1));
    }
  }

  /**
   * Toggle set completion
   */
  toggleSetCompletion(index: number): void {
    this.sets[index].completed = !this.sets[index].completed;
  }

  /**
   * Save the log
   */
  async saveLog(): Promise<void> {
    if (this.sets.length === 0) {
      await this.showToast('Add at least one set', 'warning');
      return;
    }

    // For cardio, ensure at least a duration is set
    if (this.isCardio) {
      const anyFilled = this.sets.some((s) => (s.durationMinutes ?? 0) > 0);
      if (!anyFilled) {
        await this.showToast(
          'Enter duration for at least one interval',
          'warning',
        );
        return;
      }
    }

    this.isLoading = true;

    try {
      const logData = {
        exerciseName: this.exercise.name,
        date: this.date,
        sets: this.sets,
        notes: this.notes.trim() || undefined,
      };

      if (this.existingLog) {
        // Update existing log
        await this.exerciseLogService.updateLog(this.existingLog.id, logData);
        await this.showToast('Log updated successfully', 'success');
      } else {
        // Create new log
        await this.exerciseLogService.addLog(logData);
        await this.showToast('Log saved successfully', 'success');
      }

      this.modalCtrl.dismiss({ saved: true });
    } catch (error) {
      console.error('Error saving log:', error);
      await this.showToast('Error saving log', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Copy previous workout
   */
  async copyPreviousWorkout(): Promise<void> {
    const lastLog = this.exerciseLogService.getLastLogForExercise(
      this.exercise.name,
    );

    if (!lastLog) {
      await this.showToast('No previous workout found', 'warning');
      return;
    }

    this.sets = lastLog.sets.map((set) => ({ ...set }));
    await this.showToast(`Copied from ${lastLog.date}`, 'success');
  }

  /**
   * Get completion percentage
   */
  get completionPercentage(): number {
    if (this.sets.length === 0) return 0;
    const completed = this.sets.filter((s) => s.completed).length;
    return Math.round((completed / this.sets.length) * 100);
  }

  /**
   * Get number of completed sets
   */
  get completedSetsCount(): number {
    return this.sets.filter((s) => s.completed).length;
  }

  /**
   * Get total volume (strength) or total duration (cardio)
   */
  get totalVolume(): number {
    if (this.isCardio) {
      return this.sets.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    }
    return this.sets.reduce(
      (sum, set) => sum + (set.weight || 0) * set.reps,
      0,
    );
  }

  get totalVolumeLabel(): string {
    return this.isCardio ? 'Total Min' : 'Total Volume';
  }

  get totalVolumeUnit(): string {
    return this.isCardio ? 'min' : this.useMetric ? 'kg' : 'lbs';
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
   * Close modal
   */
  close(): void {
    this.modalCtrl.dismiss();
  }
}

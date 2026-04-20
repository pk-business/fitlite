import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { Exercise, ExerciseSessionData, ActiveSet, ExerciseProgress } from '../../models';
import { isCardioExercise } from '../../models/exercise-log.model';
import { ExerciseLogService } from '../../services/exercise-log.service';
import { RestTimerService } from '../../services/rest-timer.service';
import { ProgressService } from '../../services/progress.service';
import { InlineSetLoggerComponent } from '../inline-set-logger/inline-set-logger.component';
import { ProgressGraphComponent } from '../progress-graph/progress-graph.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

/**
 * EnhancedWorkoutCardComponent provides a complete workout logging experience
 * Integrates fast set logging, progress tracking, and rest timers
 */
@Component({
  selector: 'app-enhanced-workout-card',
  standalone: true,
  imports: [CommonModule, IonicModule, InlineSetLoggerComponent, ProgressGraphComponent],
  templateUrl: './enhanced-workout-card.component.html',
  styleUrls: ['./enhanced-workout-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        opacity: '1'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms ease-in-out')
      ])
    ]),
    trigger('cardPulse', [
      transition('* => active', [
        animate('200ms ease-out', style({ transform: 'scale(1.02)' })),
        animate('200ms ease-in', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class EnhancedWorkoutCardComponent implements OnInit, OnDestroy {
  @Input() exercise!: Exercise;
  @Input() exerciseIndex: number = 0;
  @Input() useMetric: boolean = false;
  
  sessionData: ExerciseSessionData;
  progress?: ExerciseProgress;
  isExpanded: boolean = false;

  /** Emitted when user taps 'Edit Logs' — parent should navigate to progress/logs tab */
  @Output() editLogsRequested = new EventEmitter<string>();

  get isCardio(): boolean {
    return isCardioExercise(this.exercise?.name || '', this.exercise?.category);
  }

  private destroy$ = new Subject<void>();

  constructor(
    private exerciseLogService: ExerciseLogService,
    private restTimerService: RestTimerService,
    public progressService: ProgressService,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize session data (will be overridden in ngOnInit)
    this.sessionData = this.createEmptySession();
  }

  ngOnInit(): void {
    // Initialize session data from exercise
    this.sessionData = {
      exerciseName: this.exercise.name,
      plannedSets: this.exercise.sets,
      plannedReps: this.exercise.reps,
      completedSets: [],
      currentSet: null,
      isExpanded: false
    };

    // Load progress data
    this.loadProgress();

    // Load previous session data to prefill first set
    this.loadPreviousSession();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load progress for this exercise
   */
  loadProgress(): void {
    this.progress = this.progressService.getExerciseProgress(this.exercise.name);
    this.cdr.markForCheck();
  }

  /**
   * Load previous session to prefill values
   */
  loadPreviousSession(): void {
    const lastLog = this.exerciseLogService.getLastLogForExercise(this.exercise.name);
    
    // Auto-start first set with previous values
    if (lastLog && lastLog.sets.length > 0) {
      const lastSet = lastLog.sets[0];
      this.startNewSet(lastSet.weight || 0, lastSet.reps);
    } else {
      this.startNewSet(0, this.exercise.reps);
    }
  }

  /**
   * Toggle card expansion
   */
  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
    this.sessionData.isExpanded = this.isExpanded;
    this.cdr.markForCheck();
  }

  /**
   * Start a new set
   */
  startNewSet(weight: number = 0, reps: number = 0): void {
    const setNumber = this.sessionData.completedSets.length + 1;
    
    this.sessionData.currentSet = {
      setNumber,
      weight,
      reps,
      isComplete: false,
      restTimerActive: false
    };

    // Auto-expand when starting first set
    if (setNumber === 1 && !this.isExpanded) {
      this.isExpanded = true;
      this.sessionData.isExpanded = true;
    }

    this.cdr.markForCheck();
  }

  /**
   * Handle set completion
   */
  onSetCompleted(set: ActiveSet): void {
    // Add to completed sets
    this.sessionData.completedSets.push({ ...set });
    this.sessionData.lastCompletedAt = Date.now();

    // Start rest timer
    this.restTimerService.startTimer(
      this.exercise.name,
      set.setNumber,
      this.exercise.restSeconds
    );

    // Auto-start next set if more sets are planned
    if (this.sessionData.completedSets.length < this.sessionData.plannedSets) {
      setTimeout(() => {
        this.startNewSet(set.weight, set.reps);
      }, 100);
    } else {
      // All sets completed — save and collapse
      this.sessionData.currentSet = null;
      this.saveWorkout();
      setTimeout(() => {
        this.isExpanded = false;
        this.sessionData.isExpanded = false;
        this.cdr.markForCheck();
      }, 600); // small delay so user sees the final set tick
    }

    this.cdr.markForCheck();
  }

  /**
   * Handle set deletion
   */
  onSetDeleted(setNumber: number): void {
    // Remove from completed sets or current set
    if (this.sessionData.currentSet?.setNumber === setNumber) {
      this.sessionData.currentSet = null;
      
      // Start a new set with same number
      const lastCompleted = this.sessionData.completedSets[this.sessionData.completedSets.length - 1];
      this.startNewSet(
        lastCompleted?.weight || 0,
        lastCompleted?.reps || this.exercise.reps
      );
    } else {
      const index = this.sessionData.completedSets.findIndex(s => s.setNumber === setNumber);
      if (index !== -1) {
        this.sessionData.completedSets.splice(index, 1);
        // Renumber remaining sets
        this.sessionData.completedSets.forEach((s, i) => s.setNumber = i + 1);
        if (this.sessionData.currentSet) {
          this.sessionData.currentSet.setNumber = this.sessionData.completedSets.length + 1;
        }
      }
    }

    this.cdr.markForCheck();
  }

  /**
   * Handle set update
   */
  onSetUpdated(set: ActiveSet): void {
    // Update is handled by two-way binding
    this.cdr.markForCheck();
  }

  /**
   * Add an extra set
   */
  addExtraSet(): void {
    if (this.sessionData.currentSet && !this.sessionData.currentSet.isComplete) {
      // Complete current set first
      return;
    }

    const lastSet = this.sessionData.completedSets[this.sessionData.completedSets.length - 1];
    this.startNewSet(lastSet?.weight || 0, lastSet?.reps || this.exercise.reps);
  }

  /**
   * Save workout to log
   */
  async saveWorkout(): Promise<void> {
    if (this.sessionData.completedSets.length === 0) return;

    // Stop any active rest timer when workout is complete
    this.restTimerService.stopTimer();

    const exerciseLog = {
      exerciseName: this.exercise.name,
      date: new Date().toISOString().split('T')[0],
      sets: this.sessionData.completedSets.map(set => ({
        setNumber: set.setNumber,
        reps: set.reps,
        weight: set.weight,
        completed: true
      })),
      notes: ''
    };

    await this.exerciseLogService.addLog(exerciseLog);
    
    // Reload progress
    this.loadProgress();
    this.cdr.markForCheck();
  }

  /**
   * Restart exercise - clear all sets for current session
   */
  restartExercise(): void {
    // Stop any active rest timer
    this.restTimerService.stopTimer();
    
    // Reset session data and re-expand
    this.isExpanded = true;
    this.sessionData = {
      exerciseName: this.exercise.name,
      plannedSets: this.exercise.sets,
      plannedReps: this.exercise.reps,
      completedSets: [],
      currentSet: null,
      isExpanded: true
    };

    // Start fresh with first set
    this.loadPreviousSession();
    this.cdr.markForCheck();
  }

  /**
   * Open full progress view — emits event for parent to navigate to Logs tab
   */
  async openProgressModal(): Promise<void> {
    this.editLogsRequested.emit(this.exercise.name);
  }

  /**
   * Get previous set for reference
   */
  getPreviousSet(setNumber: number): ActiveSet | undefined {
    if (setNumber === 1) {
      // Get from last session
      const lastLog = this.exerciseLogService.getLastLogForExercise(this.exercise.name);
      if (lastLog && lastLog.sets.length > 0) {
        return {
          setNumber: 0,
          weight: lastLog.sets[0].weight || 0,
          reps: lastLog.sets[0].reps,
          isComplete: true,
          restTimerActive: false
        };
      }
    } else {
      // Get from current session
      return this.sessionData.completedSets[setNumber - 2];
    }
    return undefined;
  }

  /**
   * Get previous log summary (e.g., "Last: 80kg×10, 80kg×8")
   */
  getPreviousLog(): string {
    const today = new Date().toISOString().split('T')[0];
    const lastLog = this.exerciseLogService.getLastLogForExercise(this.exercise.name);
    
    if (!lastLog) {
      return '';
    }
    
    const unit = this.useMetric ? 'kg' : 'lbs';
    const setsStr = lastLog.sets
      .map(set => `${set.weight || 0}${unit}×${set.reps}`)
      .join(', ');
    
    const prefix = lastLog.date === today ? 'Today' : 'Last';
    return `${prefix}: ${setsStr}`;
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    return (this.sessionData.completedSets.length / this.sessionData.plannedSets) * 100;
  }

  /**
   * Check if all sets are complete
   */
  isComplete(): boolean {
    return this.sessionData.completedSets.length >= this.sessionData.plannedSets &&
           !this.sessionData.currentSet;
  }

  /**
   * Get muscle group icon
   */
  getMuscleGroupIcon(): string {
    const name = this.exercise.name.toLowerCase();
    
    if (name.includes('bench') || name.includes('chest') || name.includes('push-up')) {
      return 'fitness-outline';
    } else if (name.includes('squat') || name.includes('leg')) {
      return 'walk-outline';
    } else if (name.includes('deadlift') || name.includes('back') || name.includes('row')) {
      return 'body-outline';
    } else if (name.includes('shoulder') || name.includes('press')) {
      return 'hand-left-outline';
    } else if (name.includes('curl') || name.includes('arm')) {
      return 'barbell-outline';
    }
    
    return 'barbell-outline';
  }

  /**
   * Get status color based on progress
   */
  getStatusColor(): string {
    if (this.isComplete()) return 'success';
    if (this.sessionData.completedSets.length > 0) return 'warning';
    return 'medium';
  }

  /**
   * Create empty session
   */
  private createEmptySession(): ExerciseSessionData {
    return {
      exerciseName: '',
      plannedSets: 0,
      plannedReps: 0,
      completedSets: [],
      currentSet: null,
      isExpanded: false
    };
  }
}

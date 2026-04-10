import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { RestTimerService } from '../../services/rest-timer.service';
import { RestTimerState } from '../../models';
import { trigger, state, style, transition, animate } from '@angular/animations';

/**
 * RestTimerComponent displays a lightweight, non-intrusive rest timer
 * Shows as a floating bubble that can be expanded to full view
 */
@Component({
  selector: 'app-rest-timer',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './rest-timer.component.html',
  styleUrls: ['./rest-timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('timerExpand', [
      state('collapsed', style({
        width: '80px',
        height: '80px',
        borderRadius: '40px'
      })),
      state('expanded', style({
        width: '100%',
        height: '200px',
        borderRadius: '16px'
      })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ]
})
export class RestTimerComponent implements OnInit, OnDestroy {
  timerState: RestTimerState | null = null;
  isExpanded: boolean = false;
  progress: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private restTimerService: RestTimerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to timer state
    this.restTimerService.timer$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.timerState = state;
        this.progress = this.restTimerService.getProgress();
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggle expanded view
   */
  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Pause/resume timer
   */
  togglePause(): void {
    if (this.timerState?.isPaused) {
      this.restTimerService.resumeTimer();
    } else {
      this.restTimerService.pauseTimer();
    }
  }

  /**
   * Stop timer
   */
  stopTimer(): void {
    this.restTimerService.stopTimer();
    this.isExpanded = false;
  }

  /**
   * Add time to timer
   */
  addTime(seconds: number): void {
    this.restTimerService.adjustTimer(seconds);
  }

  /**
   * Get formatted time
   */
  getFormattedTime(): string {
    if (!this.timerState) return '0:00';
    return this.restTimerService.formatTime(this.timerState.remainingSeconds);
  }

  /**
   * Get progress color based on remaining time
   */
  getProgressColor(): string {
    if (!this.timerState) return 'primary';
    
    const percentRemaining = (this.timerState.remainingSeconds / this.timerState.durationSeconds) * 100;
    
    if (percentRemaining < 25) return 'danger';
    if (percentRemaining < 50) return 'warning';
    return 'success';
  }

  /**
   * Check if timer is complete
   */
  isComplete(): boolean {
    return this.timerState?.remainingSeconds === 0 && !this.timerState?.isActive;
  }
}

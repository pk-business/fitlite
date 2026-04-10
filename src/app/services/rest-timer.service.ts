import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { RestTimerState } from '../models';

/**
 * RestTimerService manages rest timers between sets
 * Provides observable state for UI components to react to
 */
@Injectable({
  providedIn: 'root',
})
export class RestTimerService {
  private timerSubject = new BehaviorSubject<RestTimerState | null>(null);
  public timer$: Observable<RestTimerState | null> =
    this.timerSubject.asObservable();

  private timerSubscription?: Subscription;
  private audioContext?: AudioContext;

  constructor() {}

  /**
   * Start a new rest timer
   * @param exerciseName Name of the exercise
   * @param setNumber Set number that was just completed
   * @param durationSeconds Rest duration in seconds
   */
  startTimer(
    exerciseName: string,
    setNumber: number,
    durationSeconds: number,
  ): void {
    // Stop any existing timer
    this.stopTimer();

    const timerState: RestTimerState = {
      exerciseName,
      setNumber,
      durationSeconds,
      remainingSeconds: durationSeconds,
      isActive: true,
      isPaused: false,
    };

    this.timerSubject.next(timerState);

    // Start countdown
    this.timerSubscription = interval(1000).subscribe(() => {
      const current = this.timerSubject.value;
      if (!current || current.isPaused) return;

      const remaining = current.remainingSeconds - 1;

      if (remaining <= 0) {
        this.onTimerComplete();
      } else {
        this.timerSubject.next({
          ...current,
          remainingSeconds: remaining,
        });
      }
    });
  }

  /**
   * Pause the active timer
   */
  pauseTimer(): void {
    const current = this.timerSubject.value;
    if (current && current.isActive) {
      this.timerSubject.next({
        ...current,
        isPaused: true,
      });
    }
  }

  /**
   * Resume a paused timer
   */
  resumeTimer(): void {
    const current = this.timerSubject.value;
    if (current && current.isActive && current.isPaused) {
      this.timerSubject.next({
        ...current,
        isPaused: false,
      });
    }
  }

  /**
   * Stop and clear the timer
   */
  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
    this.timerSubject.next(null);
  }

  /**
   * Add time to the active timer
   * @param seconds Number of seconds to add (can be negative)
   */
  adjustTimer(seconds: number): void {
    const current = this.timerSubject.value;
    if (current && current.isActive) {
      const newRemaining = Math.max(0, current.remainingSeconds + seconds);
      this.timerSubject.next({
        ...current,
        remainingSeconds: newRemaining,
        durationSeconds: current.durationSeconds + seconds,
      });

      if (newRemaining === 0) {
        this.onTimerComplete();
      }
    }
  }

  /**
   * Get current timer state
   */
  getCurrentTimer(): RestTimerState | null {
    return this.timerSubject.value;
  }

  /**
   * Check if a timer is active
   */
  isTimerActive(): boolean {
    const timer = this.timerSubject.value;
    return timer !== null && timer.isActive;
  }

  /**
   * Format seconds to MM:SS
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate progress percentage (0-100)
   */
  getProgress(): number {
    const timer = this.timerSubject.value;
    if (!timer) return 0;

    const elapsed = timer.durationSeconds - timer.remainingSeconds;
    return (elapsed / timer.durationSeconds) * 100;
  }

  /**
   * Handle timer completion
   */
  private onTimerComplete(): void {
    const current = this.timerSubject.value;
    if (!current) return;

    // Update to completed state
    this.timerSubject.next({
      ...current,
      remainingSeconds: 0,
      isActive: false,
    });

    // Vibrate device (if supported)
    this.vibrateOnComplete();

    // Play completion sound (soft beep)
    this.playCompletionSound();

    // Auto-clear after 2 seconds
    setTimeout(() => {
      this.stopTimer();
    }, 2000);
  }

  /**
   * Play a soft completion sound using Web Audio API
   */
  private playCompletionSound(): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Soft, pleasant beep
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.3,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play completion sound:', error);
    }
  }

  /**
   * Vibrate device on timer completion
   */
  private vibrateOnComplete(): void {
    try {
      // Check if vibration is supported
      if ('vibrate' in navigator) {
        // Vibrate with pattern: short-long-short
        navigator.vibrate([100, 100, 200, 100, 100]);
      }
    } catch (error) {
      console.warn('Could not vibrate device:', error);
    }
  }

  /**
   * Cleanup on service destroy
   */
  ngOnDestroy(): void {
    this.stopTimer();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

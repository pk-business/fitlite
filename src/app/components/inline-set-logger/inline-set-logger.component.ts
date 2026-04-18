import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonInput } from '@ionic/angular';
import { ActiveSet } from '../../models';
import { trigger, state, style, transition, animate } from '@angular/animations';

/**
 * InlineSetLoggerComponent provides fast, frictionless set logging
 * Inspired by Hevy's inline logging with swipe gestures
 */
@Component({
  selector: 'app-inline-set-logger',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './inline-set-logger.component.html',
  styleUrls: ['./inline-set-logger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('setComplete', [
      state('incomplete', style({ opacity: 1, transform: 'scale(1)' })),
      state('complete', style({ opacity: 0.7, transform: 'scale(0.98)' })),
      transition('incomplete => complete', [
        animate('200ms ease-out')
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class InlineSetLoggerComponent {
  @Input() set!: ActiveSet;
  @Input() previousWeight?: number;
  @Input() previousReps?: number;
  @Input() isFirst: boolean = false;
  @Input() useMetric: boolean = false;
  @Input() isCardio: boolean = false;
  
  @Output() setCompleted = new EventEmitter<ActiveSet>();
  @Output() setDeleted = new EventEmitter<number>();
  @Output() setUpdated = new EventEmitter<ActiveSet>();

  @ViewChild('weightInput') weightInput?: IonInput;
  @ViewChild('repsInput') repsInput?: IonInput;
  @ViewChild('setRow') setRow?: ElementRef;

  // Swipe gesture tracking
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private currentTranslateX: number = 0;
  
  isSwiping: boolean = false;
  swipeTranslateX: number = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * Handle weight change
   */
  onWeightChange(): void {
    this.setUpdated.emit(this.set);
  }

  /**
   * Handle reps change
   */
  onRepsChange(): void {
    this.setUpdated.emit(this.set);
  }

  /**
   * Complete the current set
   */
  completeSet(): void {
    const valid = this.isCardio
      ? (this.set.durationMinutes ?? 0) > 0
      : (this.set.weight > 0 && this.set.reps > 0);
    if (!this.set.isComplete && valid) {
      this.set.isComplete = true;
      this.setCompleted.emit(this.set);
      this.cdr.markForCheck();
    }
  }

  /**
   * Delete this set
   */
  deleteSet(): void {
    this.setDeleted.emit(this.set.setNumber);
  }

  /**
   * Focus on reps input (for auto-progression after weight entry)
   */
  focusReps(): void {
    setTimeout(() => {
      this.repsInput?.setFocus();
    }, 100);
  }

  /**
   * Touch start handler for swipe gestures
   */
  onTouchStart(event: TouchEvent): void {
    if (this.set.isComplete) return; // Don't allow swipes on completed sets
    
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.isSwiping = false;
  }

  /**
   * Touch move handler for swipe gestures
   */
  onTouchMove(event: TouchEvent): void {
    if (this.set.isComplete) return;
    
    const deltaX = event.touches[0].clientX - this.touchStartX;
    const deltaY = event.touches[0].clientY - this.touchStartY;
    
    // Determine if this is a horizontal swipe
    if (!this.isSwiping && Math.abs(deltaX) > 10) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.isSwiping = true;
      }
    }

    if (this.isSwiping) {
      event.preventDefault();
      this.swipeTranslateX = deltaX;
      this.cdr.markForCheck();
    }
  }

  /**
   * Touch end handler for swipe gestures
   */
  onTouchEnd(event: TouchEvent): void {
    if (!this.isSwiping) {
      this.swipeTranslateX = 0;
      return;
    }

    const swipeThreshold = 100; // pixels

    // Swipe right → complete set
    if (this.swipeTranslateX > swipeThreshold) {
      this.completeSet();
    }
    // Swipe left → delete set
    else if (this.swipeTranslateX < -swipeThreshold) {
      this.deleteSet();
    }

    // Reset swipe
    this.isSwiping = false;
    this.swipeTranslateX = 0;
    this.cdr.markForCheck();
  }

  /**
   * Get swipe background color based on direction
   */
  getSwipeBackgroundColor(): string {
    if (this.swipeTranslateX > 50) {
      return 'rgba(16, 185, 129, 0.2)'; // Green for complete
    } else if (this.swipeTranslateX < -50) {
      return 'rgba(239, 68, 68, 0.2)'; // Red for delete
    }
    return 'transparent';
  }

  /**
   * Get swipe icon
   */
  getSwipeIcon(): string {
    if (this.swipeTranslateX > 50) {
      return 'checkmark-circle';
    } else if (this.swipeTranslateX < -50) {
      return 'trash';
    }
    return '';
  }

  /**
   * Get swipe icon position
   */
  getSwipeIconPosition(): 'left' | 'right' | null {
    if (this.swipeTranslateX > 50) return 'left';
    if (this.swipeTranslateX < -50) return 'right';
    return null;
  }
}

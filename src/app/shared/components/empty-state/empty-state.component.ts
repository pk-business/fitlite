import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/**
 * EmptyStateComponent
 * 
 * A reusable empty state display with icon, message, and optional action.
 * Use this for lists with no data, empty search results, etc.
 * 
 * @example
 * <app-empty-state
 *   icon="barbell-outline"
 *   title="No Exercises Found"
 *   message="Try adjusting your filters or add a custom exercise."
 *   actionLabel="Add Exercise"
 *   (action)="addExercise()">
 * </app-empty-state>
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="empty-container">
      <ion-icon [name]="icon" [color]="iconColor" class="empty-icon"></ion-icon>
      
      @if (title) {
        <h3 class="empty-title">{{ title }}</h3>
      }
      
      @if (message) {
        <p class="empty-message">{{ message }}</p>
      }
      
      @if (actionLabel) {
        <ion-button 
          [fill]="actionFill" 
          [color]="actionColor"
          (click)="onAction()">
          @if (actionIcon) {
            <ion-icon slot="start" [name]="actionIcon"></ion-icon>
          }
          {{ actionLabel }}
        </ion-button>
      }
    </div>
  `,
  styles: [`
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      min-height: 200px;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-title {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ion-color-dark);
    }

    .empty-message {
      margin: 0 0 1.5rem;
      color: var(--ion-color-medium);
      font-size: 0.95rem;
      max-width: 280px;
      line-height: 1.5;
    }

    ion-button {
      --border-radius: 8px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'alert-circle-outline';
  @Input() iconColor: string = 'medium';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() actionLabel: string = '';
  @Input() actionIcon: string = '';
  @Input() actionFill: 'clear' | 'outline' | 'solid' = 'solid';
  @Input() actionColor: string = 'primary';
  
  @Output() action = new EventEmitter<void>();
  
  onAction(): void {
    this.action.emit();
  }
}

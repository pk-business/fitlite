import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/**
 * ErrorStateComponent
 * 
 * A reusable error state display with retry option.
 * Use this when data loading fails or an error occurs.
 * 
 * @example
 * <app-error-state
 *   title="Failed to Load"
 *   message="Could not load your workout plan. Please check your connection."
 *   (retry)="loadData()">
 * </app-error-state>
 */
@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="error-container">
      <ion-icon [name]="icon" color="danger" class="error-icon"></ion-icon>
      
      @if (title) {
        <h3 class="error-title">{{ title }}</h3>
      }
      
      @if (message) {
        <p class="error-message">{{ message }}</p>
      }
      
      @if (showRetry) {
        <ion-button 
          fill="outline" 
          color="primary"
          (click)="onRetry()">
          <ion-icon slot="start" name="refresh-outline"></ion-icon>
          {{ retryLabel }}
        </ion-button>
      }
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      min-height: 200px;
    }

    .error-icon {
      font-size: 64px;
      margin-bottom: 1rem;
    }

    .error-title {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ion-color-dark);
    }

    .error-message {
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
export class ErrorStateComponent {
  @Input() icon: string = 'alert-circle-outline';
  @Input() title: string = 'Something went wrong';
  @Input() message: string = 'An error occurred. Please try again.';
  @Input() showRetry: boolean = true;
  @Input() retryLabel: string = 'Try Again';
  
  @Output() retry = new EventEmitter<void>();
  
  onRetry(): void {
    this.retry.emit();
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/**
 * LoadingStateComponent
 * 
 * A reusable loading state indicator with optional message.
 * Use this instead of inline loading spinners for consistency.
 * 
 * @example
 * <app-loading-state message="Loading your workout..."></app-loading-state>
 */
@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="loading-container">
      <ion-spinner [name]="spinnerType" [color]="color"></ion-spinner>
      @if (message) {
        <p class="loading-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      min-height: 200px;
    }

    .loading-message {
      margin-top: 1rem;
      color: var(--ion-color-medium);
      font-size: 0.9rem;
      text-align: center;
    }

    ion-spinner {
      width: 48px;
      height: 48px;
    }
  `]
})
export class LoadingStateComponent {
  @Input() message: string = '';
  @Input() spinnerType: 'bubbles' | 'circles' | 'circular' | 'crescent' | 'dots' | 'lines' | 'lines-small' | 'lines-sharp' | 'lines-sharp-small' = 'crescent';
  @Input() color: string = 'primary';
}

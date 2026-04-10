import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Meal } from '../../models';
import { IonicModule } from '@ionic/angular';


/**
 * MealCardComponent displays a single meal with nutritional information
 * Reusable component with OnPush for optimal performance
 */
@Component({
    selector: 'app-meal-card',
    templateUrl: './meal-card.component.html',
    styleUrls: ['./meal-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonicModule]
})
export class MealCardComponent {
  @Input() meal!: Meal;
  @Input() showIcon = true;
  @Input() compact = false;

  /**
   * Get icon based on meal name
   */
  get mealIcon(): string {
    const name = this.meal.name.toLowerCase();
    if (name.includes('breakfast')) return 'cafe-outline';
    if (name.includes('lunch')) return 'restaurant-outline';
    if (name.includes('dinner')) return 'pizza-outline';
    if (name.includes('snack')) return 'fast-food-outline';
    return 'nutrition-outline';
  }

  /**
   * Get color based on meal name
   */
  get mealColor(): string {
    const name = this.meal.name.toLowerCase();
    if (name.includes('breakfast')) return 'warning';
    if (name.includes('lunch')) return 'primary';
    if (name.includes('dinner')) return 'secondary';
    if (name.includes('snack')) return 'success';
    return 'medium';
  }
}

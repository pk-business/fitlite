/**
 * Meal model representing a single meal with nutritional information
 */
export interface Meal {
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

/**
 * Diet day model representing a day's meal plan
 */
export interface DietDay {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  meals: Meal[];
}

/**
 * Complete diet plan for the week
 */
export interface DietPlan {
  weeklyPlan: DietDay[];
}

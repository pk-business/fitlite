/**
 * Daily nutrition log model for tracking user intake
 */
export interface DailyNutritionLog {
  id?: string; // Optional ID for storage
  date: string; // ISO date string (YYYY-MM-DD)
  caloriesConsumed: number;
  proteinConsumed: number; // in grams
  carbsConsumed: number; // in grams
  fatConsumed: number; // in grams
  waterConsumed: number; // in ml
  caloriesGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  waterGoal: number; // target water intake in ml
  achievedCalories: boolean;
  achievedProtein: boolean;
  achievedCarbs: boolean;
  achievedFat: boolean;
  achievedWater: boolean;
  loggedAt?: string; // ISO timestamp when logged
}

/**
 * Weekly nutrition summary
 */
export interface WeeklyNutritionSummary {
  weekStart: string; // ISO date string
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageWater: number;
  caloriesGoalMet: number; // percentage of days goal was met
  proteinGoalMet: number; // percentage of days goal was met
  carbsGoalMet: number; // percentage of days goal was met
  fatGoalMet: number; // percentage of days goal was met
  waterGoalMet: number; // percentage of days goal was met
}

/**
 * Nutrition suggestions based on performance
 */
export interface NutritionSuggestion {
  type: 'calories' | 'protein' | 'carbs' | 'fat' | 'water' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
}
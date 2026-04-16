/**
 * User profile model for storing personal information and fitness goals
 */
export interface UserProfile {
  name?: string; // User's name for personalization
  age: number;
  heightCm: number;
  weightKg: number;
  gender: 'male' | 'female';
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  activityLevel:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extremely_active';
  theme?: 'light' | 'dark'; // Theme preference
  // Nutrition recommendations (calculated)
  recommendedCalories?: number;
  recommendedProtein?: number;
  recommendedCarbs?: number;
  recommendedFat?: number;
}

/**
 * User profile model for storing personal information and fitness goals
 */
export interface UserProfile {
  name?: string; // User's name for personalization
  age: number;
  heightCm: number;
  weightKg: number;
  gender: 'male' | 'female' | 'other';
  goal: 'lose' | 'maintain' | 'gain';
  activityLevel: 'low' | 'medium' | 'high';
  theme?: 'light' | 'dark'; // Theme preference
}

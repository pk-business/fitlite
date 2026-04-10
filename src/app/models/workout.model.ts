/**
 * Exercise model representing a single exercise with sets and reps
 */
export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  category?: 'full' | 'upper' | 'lower' | 'cardio' | 'custom';
}

/**
 * Custom exercise model with additional metadata
 * Extends Exercise with id and custom flag for user-created exercises
 */
export interface CustomExercise extends Exercise {
  id: string;
  category: 'full' | 'upper' | 'lower' | 'cardio' | 'custom';
  isCustom: true;
  createdAt: number;
}

/**
 * Workout day model representing a day's workout plan
 */
export interface WorkoutDay {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  focus: 'full' | 'upper' | 'lower' | 'cardio';
  exercises: Exercise[];
}

/**
 * Complete workout plan for the week
 */
export interface WorkoutPlan {
  weeklyPlan: WorkoutDay[];
}

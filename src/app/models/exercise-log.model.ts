/**
 * Exercise log entry for tracking actual workout performance
 * Records what the user actually did for an exercise
 */
export interface ExerciseLog {
  id: string;
  exerciseName: string;
  date: string; // ISO date string (YYYY-MM-DD)
  sets: SetLog[];
  notes?: string;
  timestamp: number; // Unix timestamp for ordering
}

/**
 * Individual set log with actual performance data
 */
export interface SetLog {
  setNumber: number;
  reps: number;
  weight?: number; // Optional weight in kg or lbs
  completed: boolean;
}

/**
 * Summary of exercise logs for display
 */
export interface ExerciseLogSummary {
  exerciseName: string;
  lastPerformed?: string; // Date string
  totalSessions: number;
  bestSet?: SetLog; // Best performing set (most weight × reps)
}

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
 * For strength exercises: uses reps + weight
 * For cardio exercises: uses durationMinutes + distanceKm + intensity
 */
export interface SetLog {
  setNumber: number;
  reps: number;
  weight?: number; // Strength: weight in kg or lbs
  completed: boolean;
  // Cardio-specific fields
  durationMinutes?: number;
  distanceKm?: number;
  intensity?: 'low' | 'moderate' | 'high';
}

/** Keywords that identify a cardio-type exercise by name */
export const CARDIO_KEYWORDS = [
  'walk', 'walking', 'jog', 'jogging', 'run', 'running',
  'sprint', 'sprinting', 'hike', 'hiking',
  'cycle', 'cycling', 'bike', 'biking',
  'swim', 'swimming', 'row', 'rowing',
  'jump', 'jumping', 'jump rope', 'skipping',
  'elliptical', 'treadmill', 'stair', 'stairs',
  'dance', 'dancing', 'zumba', 'yoga', 'pilates',
  'stretch', 'stretching', 'cardio',
];

/**
 * Returns true if the exercise name or category indicates a cardio exercise
 */
export function isCardioExercise(name: string, category?: string): boolean {
  if (category === 'cardio') return true;
  const lower = name.toLowerCase();
  return CARDIO_KEYWORDS.some(kw => lower.includes(kw));
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

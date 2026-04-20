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

/**
 * Keywords that identify a cardio-type exercise by name.
 * Matched as whole words (word-boundary regex) to avoid false positives
 * e.g. 'row' must not match 'seated row machine' — use 'rowing' instead.
 */
export const CARDIO_KEYWORDS = [
  // Running / walking
  'walk',
  'walking',
  'jog',
  'jogging',
  'run',
  'running',
  'sprint',
  'sprinting',
  'hike',
  'hiking',
  // Cycling
  'cycling',
  'biking',
  // Water
  'swimming',
  'rowing',
  // Equipment
  'elliptical',
  'treadmill',
  'stair climber',
  'step mill',
  // Jump / skip
  'jump rope',
  'skipping',
  // Classes / other
  'zumba',
  'yoga',
  'pilates',
  'cardio',
  'aerobics',
];

/**
 * Returns true if the exercise name or category indicates a cardio exercise.
 * Uses whole-word matching to avoid false positives (e.g. "rowing" ≠ "seated row machine").
 */
export function isCardioExercise(name: string, category?: string): boolean {
  if (category === 'cardio') return true;
  const lower = name.toLowerCase();
  return CARDIO_KEYWORDS.some((kw) => {
    // Escape special regex chars in keyword, then wrap in word boundaries
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`).test(lower);
  });
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

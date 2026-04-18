/**
 * Progress tracking models for visualizing workout improvements
 */

/**
 * Progress data point for a single exercise session
 */
export interface ProgressDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  timestamp: number; // Unix timestamp
  maxWeight: number; // Maximum weight lifted in that session
  maxReps: number; // Maximum reps completed in that session
  totalVolume: number; // Total weight × reps for all sets
  averageWeight: number; // Average weight across all sets
  averageReps: number; // Average reps across all sets
}

/**
 * Progress metrics for an exercise
 */
export interface ExerciseProgress {
  exerciseName: string;
  dataPoints: ProgressDataPoint[]; // Sorted by date ascending
  trend: 'improving' | 'maintaining' | 'declining' | 'insufficient-data';
  percentChange: number; // Percentage change over the period (-100 to +Infinity)
  insight: string; // Human-readable insight (e.g., "Up 12% this month")
  personalRecord: PersonalRecord | null;
}

/**
 * Personal record information
 */
export interface PersonalRecord {
  weight: number;
  reps: number;
  date: string;
  daysAgo: number;
}

/**
 * Active set being logged
 */
export interface ActiveSet {
  setNumber: number;
  weight: number;
  reps: number;
  isComplete: boolean;
  restTimerActive: boolean;
  // Cardio fields
  durationMinutes?: number;
  distanceKm?: number;
  intensity?: 'low' | 'moderate' | 'high';
}

/**
 * Rest timer state
 */
export interface RestTimerState {
  exerciseName: string;
  setNumber: number;
  durationSeconds: number; // Total rest duration
  remainingSeconds: number; // Time remaining
  isActive: boolean;
  isPaused: boolean;
}

/**
 * Workout session state (for active workout tracking)
 */
export interface WorkoutSession {
  sessionId: string;
  date: string;
  startTime: number;
  exercises: ExerciseSessionData[];
  isActive: boolean;
}

/**
 * Exercise session data (active logging state)
 */
export interface ExerciseSessionData {
  exerciseName: string;
  plannedSets: number;
  plannedReps: number;
  completedSets: ActiveSet[];
  currentSet: ActiveSet | null;
  isExpanded: boolean;
  lastCompletedAt?: number;
}

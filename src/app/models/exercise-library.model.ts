/**
 * LibraryExercise — a pre-defined exercise entry in the app's exercise library.
 * Exercises are bundled locally (offline-first) and can later be overridden
 * or extended from a remote API response.
 */
export interface LibraryExercise {
  /** Unique stable identifier, e.g. "ex001" */
  id: string;
  /** Display name, e.g. "Bench Press" */
  name: string;
  /** Primary muscle group targeted */
  primaryMuscle: MuscleGroup;
  /** Secondary muscles involved */
  secondaryMuscles: string[];
  /** Equipment required (can be multiple) */
  equipment: EquipmentType[];
  /** Difficulty level */
  difficulty: Difficulty;
  /** URL to a short demo video (mp4 / gif) – may be empty offline */
  mediaUrl: string;
  /** URL to a static thumbnail image */
  thumbnailUrl: string;
  /** Free-text tags for broader search matching */
  tags: string[];
  /** Short human-readable description of the movement and key coaching cues */
  description?: string;
  /** Whether this exercise was created by the user */
  isCustom?: boolean;
}

/**
 * WorkoutExercise — a user-selected exercise added to a specific workout session.
 * Bridges a LibraryExercise (or a fully custom entry) with user-defined volume.
 */
export interface WorkoutExercise {
  /** Unique log entry id */
  id: string;
  /** User who logged this */
  userId: string;
  /** References LibraryExercise.id – null for fully custom exercises */
  exerciseId: string | null;
  /** Name override / custom name (required when exerciseId is null) */
  customName: string | null;
  sets: number;
  reps: number;
  /** Weight in kg; 0 for bodyweight exercises */
  weight: number;
  /** ISO date string of the workout session */
  loggedAt?: string;
  /** Optional notes */
  notes?: string;
}

// ─── Domain enums / union types ──────────────────────────────────────────────

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Glutes'
  | 'Hamstrings'
  | 'Custom';

export type EquipmentType =
  | 'Dumbbell'
  | 'Barbell'
  | 'Machine'
  | 'Cable'
  | 'Bodyweight'
  | 'Kettlebell'
  | 'Resistance Band'
  | 'Other';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// ─── Filter state passed between components ───────────────────────────────────

export interface ExerciseFilters {
  muscles: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: Difficulty[];
  searchQuery: string;
}

export const DEFAULT_FILTERS: ExerciseFilters = {
  muscles: [],
  equipment: [],
  difficulty: [],
  searchQuery: ''
};

/**
 * Unified Exercise Models
 * 
 * This file provides a consistent set of exercise-related types used throughout the app.
 * It consolidates the previously fragmented Exercise, CustomExercise, and LibraryExercise types.
 */

// ─── Domain Enums ─────────────────────────────────────────────────────────────

/**
 * Muscle groups that exercises can target
 */
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

/**
 * Types of equipment that can be used for exercises
 */
export type EquipmentType =
  | 'Dumbbell'
  | 'Barbell'
  | 'Machine'
  | 'Cable'
  | 'Bodyweight'
  | 'Kettlebell'
  | 'Resistance Band'
  | 'Other';

/**
 * Exercise difficulty levels
 */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Workout focus areas (legacy categories)
 */
export type WorkoutFocus = 'full' | 'upper' | 'lower' | 'cardio' | 'custom';

// ─── Core Interfaces ──────────────────────────────────────────────────────────

/**
 * BaseExercise - common properties shared by all exercise types
 */
export interface BaseExercise {
  /** Unique stable identifier */
  id: string;
  /** Display name */
  name: string;
  /** Whether this exercise was created by the user */
  isCustom?: boolean;
}

/**
 * LibraryExercise - a pre-defined or user-created exercise entry in the library
 * This is the primary exercise type used throughout the app
 */
export interface LibraryExercise extends BaseExercise {
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
  /** Short human-readable description of the movement */
  description?: string;
  /** Optional: creation timestamp for custom exercises */
  createdAt?: number;
}

/**
 * WorkoutExercise - an exercise within a workout plan with volume parameters
 * Represents how an exercise is performed (sets, reps, etc.)
 */
export interface WorkoutExercise {
  /** Reference to the base exercise name */
  name: string;
  /** Number of sets */
  sets: number;
  /** Number of reps per set */
  reps: number;
  /** Rest time between sets in seconds */
  restSeconds: number;
  /** Optional: category for legacy compatibility */
  category?: WorkoutFocus;
  /** Optional: reference to LibraryExercise.id */
  exerciseId?: string;
  /** Optional: weight in kg */
  weight?: number;
  /** Optional: notes */
  notes?: string;
}

/**
 * LoggedExercise - an exercise that has been logged/completed
 * Extends WorkoutExercise with logging metadata
 */
export interface LoggedExercise extends WorkoutExercise {
  /** Unique log entry id */
  id: string;
  /** ISO date string of when it was logged */
  loggedAt: string;
  /** Per-set details */
  setDetails?: SetDetail[];
}

/**
 * SetDetail - detailed information about a single set
 */
export interface SetDetail {
  /** Set number (1-indexed) */
  setNumber: number;
  /** Reps completed */
  reps: number;
  /** Weight used (kg) */
  weight: number;
  /** Whether set was completed */
  completed: boolean;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

/**
 * ExerciseFilters - filter criteria for searching exercises
 */
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

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Generate a unique exercise ID
 */
export function generateExerciseId(prefix: string = 'ex'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert a LibraryExercise to a WorkoutExercise with default volume
 */
export function libraryToWorkoutExercise(
  exercise: LibraryExercise,
  defaults: { sets?: number; reps?: number; restSeconds?: number } = {}
): WorkoutExercise {
  return {
    name: exercise.name,
    sets: defaults.sets ?? 3,
    reps: defaults.reps ?? 12,
    restSeconds: defaults.restSeconds ?? 60,
    exerciseId: exercise.id,
    category: muscleGroupToFocus(exercise.primaryMuscle)
  };
}

/**
 * Map muscle group to legacy workout focus
 */
export function muscleGroupToFocus(muscle: MuscleGroup): WorkoutFocus {
  switch (muscle) {
    case 'Chest':
    case 'Shoulders':
    case 'Arms':
      return 'upper';
    case 'Legs':
    case 'Glutes':
    case 'Hamstrings':
      return 'lower';
    case 'Back':
      return 'upper';
    case 'Core':
      return 'full';
    case 'Custom':
    default:
      return 'custom';
  }
}

/**
 * Map legacy workout focus to primary muscle group
 */
export function focusToMuscleGroup(focus: WorkoutFocus): MuscleGroup {
  switch (focus) {
    case 'upper':
      return 'Chest';
    case 'lower':
      return 'Legs';
    case 'cardio':
      return 'Core';
    case 'full':
      return 'Core';
    case 'custom':
    default:
      return 'Custom';
  }
}

/**
 * Create a minimal LibraryExercise from basic info (for custom exercises)
 */
export function createCustomLibraryExercise(
  name: string,
  primaryMuscle: MuscleGroup = 'Custom',
  equipment: EquipmentType[] = ['Bodyweight']
): Omit<LibraryExercise, 'id' | 'isCustom'> {
  return {
    name,
    primaryMuscle,
    secondaryMuscles: [],
    equipment,
    difficulty: 'beginner',
    mediaUrl: '',
    thumbnailUrl: '',
    tags: ['custom'],
    description: '',
    createdAt: Date.now()
  };
}

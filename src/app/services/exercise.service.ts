import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CustomExercise, Exercise } from '../models';
import { StorageService } from './storage.service';

const CUSTOM_EXERCISES_KEY = 'custom_exercises';

/**
 * @deprecated Use ExerciseLibraryService instead.
 * 
 * This service was used for custom user-created exercises but has been
 * superseded by ExerciseLibraryService which provides a unified approach
 * to both bundled and custom exercises.
 * 
 * Storage migration: Data in 'custom_exercises' should be migrated to
 * 'custom_library_exercises' used by ExerciseLibraryService.
 * 
 * TODO: Remove this file after verifying no data migration is needed.
 * 
 * ExerciseService manages custom user-created exercises
 * Provides CRUD operations and observable for reactive UI
 */
@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private exercisesSubject = new BehaviorSubject<CustomExercise[]>([]);
  public exercises$: Observable<CustomExercise[]> = this.exercisesSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadExercises();
  }

  /**
   * Load all custom exercises from storage
   */
  async loadExercises(): Promise<CustomExercise[]> {
    try {
      const exercises = await this.storage.get<CustomExercise[]>(CUSTOM_EXERCISES_KEY) || [];
      this.exercisesSubject.next(exercises);
      return exercises;
    } catch (error) {
      console.error('Error loading custom exercises:', error);
      return [];
    }
  }

  /**
   * Get all custom exercises (synchronous)
   */
  getAllExercises(): CustomExercise[] {
    return this.exercisesSubject.value;
  }

  /**
   * Get exercises by category
   */
  getExercisesByCategory(category: 'full' | 'upper' | 'lower' | 'cardio' | 'custom'): CustomExercise[] {
    return this.exercisesSubject.value.filter(ex => ex.category === category);
  }

  /**
   * Get exercise by ID
   */
  getExerciseById(id: string): CustomExercise | undefined {
    return this.exercisesSubject.value.find(ex => ex.id === id);
  }

  /**
   * Add a new custom exercise
   */
  async addExercise(exercise: Omit<CustomExercise, 'id' | 'isCustom' | 'createdAt'>): Promise<CustomExercise> {
    try {
      const newExercise: CustomExercise = {
        ...exercise,
        id: this.generateId(),
        isCustom: true,
        createdAt: Date.now()
      };

      const exercises = [...this.exercisesSubject.value, newExercise];
      await this.storage.set(CUSTOM_EXERCISES_KEY, exercises);
      this.exercisesSubject.next(exercises);

      return newExercise;
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  }

  /**
   * Update an existing custom exercise
   */
  async updateExercise(id: string, updates: Partial<CustomExercise>): Promise<CustomExercise | null> {
    try {
      const exercises = this.exercisesSubject.value;
      const index = exercises.findIndex(ex => ex.id === id);

      if (index === -1) {
        console.error('Exercise not found:', id);
        return null;
      }

      exercises[index] = { ...exercises[index], ...updates };
      await this.storage.set(CUSTOM_EXERCISES_KEY, exercises);
      this.exercisesSubject.next([...exercises]);

      return exercises[index];
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  }

  /**
   * Delete a custom exercise
   */
  async deleteExercise(id: string): Promise<boolean> {
    try {
      const exercises = this.exercisesSubject.value.filter(ex => ex.id !== id);
      await this.storage.set(CUSTOM_EXERCISES_KEY, exercises);
      this.exercisesSubject.next(exercises);
      return true;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      return false;
    }
  }

  /**
   * Delete all custom exercises
   */
  async deleteAllExercises(): Promise<void> {
    try {
      await this.storage.remove(CUSTOM_EXERCISES_KEY);
      this.exercisesSubject.next([]);
    } catch (error) {
      console.error('Error deleting all exercises:', error);
      throw error;
    }
  }

  /**
   * Convert CustomExercise to Exercise (for use in workout plans)
   */
  toExercise(customExercise: CustomExercise): Exercise {
    return {
      name: customExercise.name,
      sets: customExercise.sets,
      reps: customExercise.reps,
      restSeconds: customExercise.restSeconds,
      category: customExercise.category
    };
  }

  /**
   * Generate a unique ID for new exercises
   */
  private generateId(): string {
    return `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get default exercise templates (for reference)
   */
  getDefaultExerciseTemplates(): Exercise[] {
    return [
      // Upper body
      { name: 'Push-ups', sets: 3, reps: 12, restSeconds: 60, category: 'upper' },
      { name: 'Pike Push-ups', sets: 3, reps: 10, restSeconds: 60, category: 'upper' },
      { name: 'Dumbbell Rows', sets: 3, reps: 12, restSeconds: 60, category: 'upper' },
      { name: 'Dumbbell Bicep Curls', sets: 3, reps: 12, restSeconds: 60, category: 'upper' },
      { name: 'Tricep Dips', sets: 3, reps: 12, restSeconds: 60, category: 'upper' },
      
      // Lower body
      { name: 'Bodyweight Squats', sets: 3, reps: 15, restSeconds: 60, category: 'lower' },
      { name: 'Lunges', sets: 3, reps: 12, restSeconds: 60, category: 'lower' },
      { name: 'Bulgarian Split Squats', sets: 3, reps: 10, restSeconds: 60, category: 'lower' },
      { name: 'Glute Bridges', sets: 3, reps: 15, restSeconds: 60, category: 'lower' },
      { name: 'Calf Raises', sets: 3, reps: 20, restSeconds: 45, category: 'lower' },
      
      // Full body
      { name: 'Plank', sets: 3, reps: 1, restSeconds: 60, category: 'full' },
      
      // Cardio
      { name: 'Jumping Jacks', sets: 3, reps: 30, restSeconds: 30, category: 'cardio' },
      { name: 'High Knees', sets: 3, reps: 30, restSeconds: 30, category: 'cardio' },
      { name: 'Burpees', sets: 3, reps: 10, restSeconds: 45, category: 'cardio' },
      { name: 'Mountain Climbers', sets: 3, reps: 20, restSeconds: 30, category: 'cardio' },
      { name: 'Jump Rope', sets: 3, reps: 1, restSeconds: 60, category: 'cardio' }
    ];
  }
}

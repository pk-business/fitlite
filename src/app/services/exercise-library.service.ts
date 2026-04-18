import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  LibraryExercise,
  ExerciseFilters,
  DEFAULT_FILTERS,
  MuscleGroup,
  EquipmentType,
} from '../models/exercise-library.model';
import { StorageService } from './storage.service';

const RECENTLY_USED_KEY = 'recently_used_exercises';
const CUSTOM_LIBRARY_KEY = 'custom_library_exercises';
const MAX_RECENT = 10;

const POPULAR_IDS = ['ex001', 'ex006', 'ex008', 'ex003', 'ex005'];

/**
 * ExerciseLibraryService
 *
 * Data strategy:
 *  - On init, loadLibrary() iterates through `sources` in order.
 *  - Currently the only source is the bundled JSON asset.
 *  - When a real API is ready, prepend its URL to `sources`; the asset
 *    automatically becomes the offline fallback.
 *  - If all sources fail the library stays empty — users can still add
 *    custom exercises.
 */
@Injectable({ providedIn: 'root' })
export class ExerciseLibraryService {
  private filtersSubject = new BehaviorSubject<ExerciseFilters>({
    ...DEFAULT_FILTERS,
  });
  private customExercisesSubject = new BehaviorSubject<LibraryExercise[]>([]);
  private recentlyUsedIdsSubject = new BehaviorSubject<string[]>([]);
  private fullLibrarySubject = new BehaviorSubject<LibraryExercise[]>([]);

  filters$: Observable<ExerciseFilters> = this.filtersSubject.asObservable();

  allExercises$: Observable<LibraryExercise[]> = combineLatest([
    this.fullLibrarySubject,
    this.customExercisesSubject,
  ]).pipe(map(([library, custom]) => [...library, ...custom]));

  filteredExercises$: Observable<LibraryExercise[]> = combineLatest([
    this.allExercises$,
    this.filtersSubject,
  ]).pipe(map(([exercises, filters]) => this.applyFilters(exercises, filters)));

  recentlyUsed$: Observable<LibraryExercise[]> = combineLatest([
    this.allExercises$,
    this.recentlyUsedIdsSubject,
  ]).pipe(
    map(([exercises, ids]) =>
      ids
        .slice(0, 5)
        .map((id) => exercises.find((e) => e.id === id))
        .filter((e): e is LibraryExercise => !!e),
    ),
  );

  popular$: Observable<LibraryExercise[]> = this.allExercises$.pipe(
    map((exercises) =>
      POPULAR_IDS.map((id) => exercises.find((e) => e.id === id)).filter(
        (e): e is LibraryExercise => !!e,
      ),
    ),
  );

  constructor(private storage: StorageService) {
    this.init();
  }

  private async init(): Promise<void> {
    const [custom, recent] = await Promise.all([
      this.storage.get<LibraryExercise[]>(CUSTOM_LIBRARY_KEY),
      this.storage.get<string[]>(RECENTLY_USED_KEY),
    ]);
    this.customExercisesSubject.next(custom || []);
    this.recentlyUsedIdsSubject.next(recent || []);
    await this.loadLibrary();
  }

  private async loadLibrary(): Promise<void> {
    const sources = [
      // 'https://api.fitlite.app/v1/exercises',  // prepend real API URL here
      'assets/data/exercise-library.json',
    ];
    for (const url of sources) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as LibraryExercise[];
          if (Array.isArray(data) && data.length > 0) {
            this.fullLibrarySubject.next(data);
            return;
          }
        }
      } catch {
        /* source unavailable — try next */
      }
    }
  }

  // ── Filtering ────────────────────────────────────────────────────────────

  setFilters(filters: Partial<ExerciseFilters>): void {
    this.filtersSubject.next({ ...this.filtersSubject.value, ...filters });
  }

  clearFilters(): void {
    this.filtersSubject.next({ ...DEFAULT_FILTERS });
  }

  toggleMuscle(muscle: string): void {
    const c = this.filtersSubject.value;
    const muscles = c.muscles.includes(muscle as any)
      ? c.muscles.filter((m) => m !== muscle)
      : [...c.muscles, muscle as any];
    this.setFilters({ muscles });
  }

  toggleEquipment(eq: string): void {
    const c = this.filtersSubject.value;
    const equipment = c.equipment.includes(eq as any)
      ? c.equipment.filter((e) => e !== eq)
      : [...c.equipment, eq as any];
    this.setFilters({ equipment });
  }

  toggleDifficulty(diff: string): void {
    const c = this.filtersSubject.value;
    const difficulty = c.difficulty.includes(diff as any)
      ? c.difficulty.filter((d) => d !== diff)
      : [...c.difficulty, diff as any];
    this.setFilters({ difficulty });
  }

  setSearchQuery(query: string): void {
    this.setFilters({ searchQuery: query });
  }

  private applyFilters(
    exercises: LibraryExercise[],
    filters: ExerciseFilters,
  ): LibraryExercise[] {
    return exercises.filter((ex) => {
      if (
        filters.muscles.length > 0 &&
        !filters.muscles.includes(ex.primaryMuscle)
      )
        return false;
      if (
        filters.equipment.length > 0 &&
        !ex.equipment.some((e) => filters.equipment.includes(e as any))
      )
        return false;
      if (
        filters.difficulty.length > 0 &&
        !filters.difficulty.includes(ex.difficulty)
      )
        return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const match =
          ex.name.toLowerCase().includes(q) ||
          ex.primaryMuscle.toLowerCase().includes(q) ||
          (ex.description?.toLowerCase().includes(q) ?? false) ||
          ex.tags.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }

  // ── Recently used ────────────────────────────────────────────────────────

  async markAsUsed(exerciseId: string): Promise<void> {
    const current = this.recentlyUsedIdsSubject.value.filter(
      (id) => id !== exerciseId,
    );
    const updated = [exerciseId, ...current].slice(0, MAX_RECENT);
    this.recentlyUsedIdsSubject.next(updated);
    await this.storage.set(RECENTLY_USED_KEY, updated);
  }

  // ── Custom exercises ─────────────────────────────────────────────────────

  async addCustomExercise(
    exercise: Omit<LibraryExercise, 'id' | 'isCustom'>,
  ): Promise<LibraryExercise> {
    const newExercise: LibraryExercise = {
      ...exercise,
      id: 'custom_' + Date.now(),
      isCustom: true,
    };
    const updated = [...this.customExercisesSubject.value, newExercise];
    this.customExercisesSubject.next(updated);
    await this.storage.set(CUSTOM_LIBRARY_KEY, updated);
    return newExercise;
  }

  async deleteCustomExercise(id: string): Promise<void> {
    const updated = this.customExercisesSubject.value.filter(
      (e) => e.id !== id,
    );
    this.customExercisesSubject.next(updated);
    await this.storage.set(CUSTOM_LIBRARY_KEY, updated);
  }

  getExerciseById(id: string): LibraryExercise | undefined {
    return [
      ...this.fullLibrarySubject.value,
      ...this.customExercisesSubject.value,
    ].find((e) => e.id === id);
  }

  /**
   * Get all custom exercises (synchronous)
   */
  getCustomExercises(): LibraryExercise[] {
    return this.customExercisesSubject.value;
  }

  /**
   * Get custom exercises filtered by muscle group
   */
  getCustomExercisesByMuscle(muscle: MuscleGroup): LibraryExercise[] {
    return this.customExercisesSubject.value.filter(
      (ex) => ex.primaryMuscle === muscle,
    );
  }

  /**
   * Quick add a custom exercise with minimal info
   * Used by workout builder for inline exercise creation
   */
  async addQuickCustomExercise(
    name: string,
    primaryMuscle: MuscleGroup = 'Custom',
    equipment: EquipmentType[] = ['Bodyweight'],
  ): Promise<LibraryExercise> {
    return this.addCustomExercise({
      name,
      primaryMuscle,
      secondaryMuscles: [],
      equipment,
      difficulty: 'beginner',
      mediaUrl: '',
      thumbnailUrl: '',
      tags: ['custom'],
      description: '',
    });
  }

  /**
   * Find exercise by name (case-insensitive)
   * Useful for matching exercises across different contexts
   */
  findExerciseByName(name: string): LibraryExercise | undefined {
    const normalizedName = name.toLowerCase().trim();
    return [
      ...this.fullLibrarySubject.value,
      ...this.customExercisesSubject.value,
    ].find((e) => e.name.toLowerCase().trim() === normalizedName);
  }

  // ── Chip metadata ────────────────────────────────────────────────────────

  readonly muscleGroups = [
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core',
  ];
  readonly equipmentTypes = [
    'Dumbbell',
    'Barbell',
    'Machine',
    'Cable',
    'Bodyweight',
  ];
  readonly difficultyLevels: { value: string; label: string; color: string }[] =
    [
      { value: 'beginner', label: 'Beginner', color: 'success' },
      { value: 'intermediate', label: 'Intermediate', color: 'warning' },
      { value: 'advanced', label: 'Advanced', color: 'danger' },
    ];
}

import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { ExerciseLogService } from './exercise-log.service';
import { NutritionTrackingService } from './nutrition-tracking.service';
import { UserProfileService } from './user-profile.service';
import { PlanService } from './plan.service';

export interface FitliteExportBundle {
  /** Schema version for forward compatibility */
  version: number;
  exportedAt: string; // ISO timestamp
  exerciseLogs: any[];
  nutritionLogs: any[];
  userProfile: any | null;
  workoutPlan: any | null;
  dietPlan: any | null;
  customExercises: any[];
}

const EXPORT_VERSION = 1;
const EXERCISE_LOGS_KEY = 'exercise_logs';
const NUTRITION_LOGS_KEY = 'nutrition_logs';
const USER_PROFILE_KEY = 'user_profile';
const WORKOUT_PLAN_KEY = 'workout_plan';
const DIET_PLAN_KEY = 'diet_plan';
const CUSTOM_EXERCISES_KEY = 'custom_exercises';

@Injectable({ providedIn: 'root' })
export class DataTransferService {
  constructor(
    private storage: StorageService,
    private exerciseLogService: ExerciseLogService,
    private nutritionTrackingService: NutritionTrackingService,
    private userProfileService: UserProfileService,
    private planService: PlanService,
  ) {}

  // ─────────────────────────── EXPORT ────────────────────────────────────

  /**
   * Bundle all local data and trigger a .json file download.
   * On iOS the browser shares the file via the native Share sheet.
   */
  async exportData(): Promise<void> {
    const [exerciseLogs, nutritionLogs, userProfile, workoutPlan, dietPlan, customExercises] =
      await Promise.all([
        this.storage.get<any[]>(EXERCISE_LOGS_KEY),
        this.storage.get<any[]>(NUTRITION_LOGS_KEY),
        this.storage.get<any>(USER_PROFILE_KEY),
        this.storage.get<any>(WORKOUT_PLAN_KEY),
        this.storage.get<any>(DIET_PLAN_KEY),
        this.storage.get<any[]>(CUSTOM_EXERCISES_KEY),
      ]);

    const bundle: FitliteExportBundle = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      exerciseLogs: exerciseLogs ?? [],
      nutritionLogs: nutritionLogs ?? [],
      userProfile: userProfile ?? null,
      workoutPlan: workoutPlan ?? null,
      dietPlan: dietPlan ?? null,
      customExercises: customExercises ?? [],
    };

    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    const filename = `fitlite-backup-${date}.json`;

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();

    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    }, 1000);
  }

  // ─────────────────────────── IMPORT ────────────────────────────────────

  /**
   * Read a File object, validate it as a FitliteExportBundle,
   * merge exercise logs (dedup by id), replace everything else.
   * Returns a summary of what was imported.
   */
  async importData(file: File): Promise<{ exerciseLogs: number; nutritionLogs: number; hasProfile: boolean; hasWorkoutPlan: boolean }> {
    const text = await file.text();
    let bundle: FitliteExportBundle;

    try {
      bundle = JSON.parse(text);
    } catch {
      throw new Error('Invalid file — could not parse JSON.');
    }

    if (!bundle.version || !Array.isArray(bundle.exerciseLogs)) {
      throw new Error('Invalid file — not a FitLite backup.');
    }

    // ── Exercise logs: merge, dedup by id ──
    const existingLogs = (await this.storage.get<any[]>(EXERCISE_LOGS_KEY)) ?? [];
    const existingIds = new Set(existingLogs.map((l: any) => l.id));
    const newLogs = bundle.exerciseLogs.filter((l: any) => !existingIds.has(l.id));
    const mergedLogs = [...newLogs, ...existingLogs].sort(
      (a: any, b: any) => b.timestamp - a.timestamp,
    );
    await this.storage.set(EXERCISE_LOGS_KEY, mergedLogs);
    await this.exerciseLogService.loadLogs();

    // ── Nutrition logs: merge, dedup by date ──
    let nutritionImportedCount = 0;
    if (Array.isArray(bundle.nutritionLogs) && bundle.nutritionLogs.length > 0) {
      const existingNutrition = (await this.storage.get<any[]>(NUTRITION_LOGS_KEY)) ?? [];
      const existingDates = new Set(existingNutrition.map((l: any) => l.date));
      const newNutrition = bundle.nutritionLogs.filter((l: any) => !existingDates.has(l.date));
      nutritionImportedCount = newNutrition.length;
      const mergedNutrition = [...newNutrition, ...existingNutrition];
      await this.storage.set(NUTRITION_LOGS_KEY, mergedNutrition);
      await this.nutritionTrackingService.loadLogs();
    }

    // ── Profile: replace only if not already set ──
    if (bundle.userProfile) {
      const existing = await this.storage.get(USER_PROFILE_KEY);
      if (!existing) {
        await this.storage.set(USER_PROFILE_KEY, bundle.userProfile);
      }
    }

    // ── Workout plan: replace only if not already set ──
    if (bundle.workoutPlan) {
      const existing = await this.storage.get(WORKOUT_PLAN_KEY);
      if (!existing) {
        await this.storage.set(WORKOUT_PLAN_KEY, bundle.workoutPlan);
        await this.planService.getWorkoutPlan();
      }
    }

    // ── Diet plan: replace only if not already set ──
    if (bundle.dietPlan) {
      const existing = await this.storage.get(DIET_PLAN_KEY);
      if (!existing) {
        await this.storage.set(DIET_PLAN_KEY, bundle.dietPlan);
      }
    }

    // ── Custom exercises: merge by name ──
    if (Array.isArray(bundle.customExercises) && bundle.customExercises.length > 0) {
      const existing = (await this.storage.get<any[]>(CUSTOM_EXERCISES_KEY)) ?? [];
      const existingNames = new Set(existing.map((e: any) => e.name?.toLowerCase()));
      const newEx = bundle.customExercises.filter(
        (e: any) => !existingNames.has(e.name?.toLowerCase()),
      );
      await this.storage.set(CUSTOM_EXERCISES_KEY, [...existing, ...newEx]);
    }

    return {
      exerciseLogs: newLogs.length,
      nutritionLogs: nutritionImportedCount,
      hasProfile: !!bundle.userProfile,
      hasWorkoutPlan: !!bundle.workoutPlan,
    };
  }
}

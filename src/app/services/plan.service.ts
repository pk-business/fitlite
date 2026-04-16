import { Injectable } from '@angular/core';
import { UserProfile, WorkoutPlan, WorkoutDay, Exercise, DietPlan, DietDay, Meal } from '../models';
import { StorageService } from './storage.service';
import { UserProfileService } from './user-profile.service';
import { ExerciseService } from './exercise.service';
import { NutritionService } from './nutrition.service';

const WORKOUT_PLAN_KEY = 'workout_plan';
const DIET_PLAN_KEY = 'diet_plan';

/**
 * PlanService generates rule-based workout and diet plans
 * based on user profile and fitness goals
 * Now supports custom user-created exercises
 */
@Injectable({
  providedIn: 'root',
})
export class PlanService {
  constructor(
    private storage: StorageService,
    private userProfileService: UserProfileService,
    private exerciseService: ExerciseService,
    private nutritionService: NutritionService,
  ) {}

  // ========================
  // WORKOUT PLAN GENERATION
  // ========================

  /**
   * Generate a weekly workout plan based on user profile
   * @param profile User profile
   * @returns WorkoutPlan
   */
  async generateWorkoutPlan(profile: UserProfile): Promise<WorkoutPlan> {
    const weeklyPlan: WorkoutDay[] = [];

    // Determine workout frequency based on activity level
    const workoutDays = this.getWorkoutDaysByActivityLevel(
      profile.activityLevel,
    );

    // Generate workout days
    workoutDays.forEach((dayConfig) => {
      weeklyPlan.push({
        dayOfWeek: dayConfig.dayOfWeek,
        focus: dayConfig.focus,
        exercises: this.getExercisesForFocus(dayConfig.focus, profile),
      });
    });

    const workoutPlan: WorkoutPlan = { weeklyPlan };

    // Save to storage
    await this.storage.set(WORKOUT_PLAN_KEY, workoutPlan);

    return workoutPlan;
  }

  /**
   * Get workout plan from storage
   */
  async getWorkoutPlan(): Promise<WorkoutPlan | null> {
    return await this.storage.get<WorkoutPlan>(WORKOUT_PLAN_KEY);
  }

  /**
   * Get today's workout
   */
  async getTodaysWorkout(): Promise<WorkoutDay | null> {
    const plan = await this.getWorkoutPlan();
    if (!plan) return null;

    const today = new Date().getDay();
    return plan.weeklyPlan.find((day) => day.dayOfWeek === today) || null;
  }

  /**
   * Determine workout days based on activity level
   */
  private getWorkoutDaysByActivityLevel(
    activityLevel: string,
  ): { dayOfWeek: number; focus: 'full' | 'upper' | 'lower' | 'cardio' }[] {
    switch (activityLevel) {
      case 'low':
        // 3 days: Full body workouts
        return [
          { dayOfWeek: 1, focus: 'full' }, // Monday
          { dayOfWeek: 3, focus: 'full' }, // Wednesday
          { dayOfWeek: 5, focus: 'full' }, // Friday
        ];

      case 'medium':
        // 4 days: Upper/Lower split
        return [
          { dayOfWeek: 1, focus: 'upper' }, // Monday
          { dayOfWeek: 2, focus: 'lower' }, // Tuesday
          { dayOfWeek: 4, focus: 'upper' }, // Thursday
          { dayOfWeek: 5, focus: 'lower' }, // Friday
        ];

      case 'high':
        // 5-6 days: Upper/Lower/Cardio
        return [
          { dayOfWeek: 1, focus: 'upper' }, // Monday
          { dayOfWeek: 2, focus: 'lower' }, // Tuesday
          { dayOfWeek: 3, focus: 'cardio' }, // Wednesday
          { dayOfWeek: 4, focus: 'upper' }, // Thursday
          { dayOfWeek: 5, focus: 'lower' }, // Friday
          { dayOfWeek: 6, focus: 'cardio' }, // Saturday
        ];

      default:
        return [
          { dayOfWeek: 1, focus: 'full' },
          { dayOfWeek: 3, focus: 'full' },
          { dayOfWeek: 5, focus: 'full' },
        ];
    }
  }

  /**
   * Get exercises for a specific workout focus
   * Mixes custom user exercises with default templates
   */
  private getExercisesForFocus(
    focus: 'full' | 'upper' | 'lower' | 'cardio',
    profile: UserProfile,
  ): Exercise[] {
    // Adjust sets/reps based on goal
    const setsRepsConfig = this.getSetsRepsForGoal(profile.goal);

    // Get custom exercises for this category
    const customExercises = this.exerciseService.getExercisesByCategory(focus);

    // If user has custom exercises for this category, use them (convert to Exercise[])
    if (customExercises.length > 0) {
      return customExercises.map((ex) => this.exerciseService.toExercise(ex));
    }

    // Otherwise, use default exercises
    switch (focus) {
      case 'full':
        return [
          {
            name: 'Push-ups',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'full',
          },
          {
            name: 'Bodyweight Squats',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'full',
          },
          {
            name: 'Plank',
            sets: 3,
            reps: 1,
            restSeconds: 60,
            category: 'full',
          }, // Duration-based
          {
            name: 'Lunges',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'full',
          },
          {
            name: 'Dumbbell Rows',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'full',
          },
        ];

      case 'upper':
        return [
          {
            name: 'Push-ups',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'upper',
          },
          {
            name: 'Pike Push-ups',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'upper',
          },
          {
            name: 'Dumbbell Rows',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'upper',
          },
          {
            name: 'Dumbbell Bicep Curls',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'upper',
          },
          {
            name: 'Tricep Dips',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'upper',
          },
        ];

      case 'lower':
        return [
          {
            name: 'Bodyweight Squats',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'lower',
          },
          {
            name: 'Lunges',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'lower',
          },
          {
            name: 'Bulgarian Split Squats',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'lower',
          },
          {
            name: 'Glute Bridges',
            ...setsRepsConfig,
            restSeconds: 60,
            category: 'lower',
          },
          {
            name: 'Calf Raises',
            sets: 3,
            reps: 20,
            restSeconds: 45,
            category: 'lower',
          },
        ];

      case 'cardio':
        return [
          {
            name: 'Jumping Jacks',
            sets: 3,
            reps: 30,
            restSeconds: 30,
            category: 'cardio',
          },
          {
            name: 'High Knees',
            sets: 3,
            reps: 30,
            restSeconds: 30,
            category: 'cardio',
          },
          {
            name: 'Burpees',
            sets: 3,
            reps: 10,
            restSeconds: 45,
            category: 'cardio',
          },
          {
            name: 'Mountain Climbers',
            sets: 3,
            reps: 20,
            restSeconds: 30,
            category: 'cardio',
          },
          {
            name: 'Jump Rope',
            sets: 3,
            reps: 1,
            restSeconds: 60,
            category: 'cardio',
          }, // Duration-based
        ];

      default:
        return [];
    }
  }

  /**
   * Get sets and reps configuration based on user goal
   */
  private getSetsRepsForGoal(
    goal: 'lose_weight' | 'maintain' | 'gain_muscle',
  ): { sets: number; reps: number } {
    switch (goal) {
      case 'lose_weight':
        return { sets: 3, reps: 15 }; // Higher reps for fat loss
      case 'gain_muscle':
        return { sets: 4, reps: 8 }; // Lower reps, higher sets for muscle gain
      case 'maintain':
      default:
        return { sets: 3, reps: 12 }; // Moderate for maintenance
    }
  }

  // ========================
  // DIET PLAN GENERATION
  // ========================

  /**
   * Generate a weekly diet plan based on user profile
   * @param profile User profile
   * @returns DietPlan
   */
  async generateDietPlan(profile: UserProfile): Promise<DietPlan> {
    const targetCalories =
      this.nutritionService.calculateRecommendedCalories(profile);
    const macros = this.calculateMacros(targetCalories, profile.goal);

    const weeklyPlan: DietDay[] = [];

    // Generate meal plan for each day (similar structure each day)
    for (let day = 0; day < 7; day++) {
      weeklyPlan.push({
        dayOfWeek: day,
        meals: this.generateDailyMeals(targetCalories, macros),
      });
    }

    const dietPlan: DietPlan = { weeklyPlan };

    // Save to storage
    await this.storage.set(DIET_PLAN_KEY, dietPlan);

    return dietPlan;
  }

  /**
   * Get diet plan from storage
   */
  async getDietPlan(): Promise<DietPlan | null> {
    return await this.storage.get<DietPlan>(DIET_PLAN_KEY);
  }

  /**
   * Get today's meals
   */
  async getTodaysMeals(): Promise<DietDay | null> {
    const plan = await this.getDietPlan();
    if (!plan) return null;

    const today = new Date().getDay();
    return plan.weeklyPlan.find((day) => day.dayOfWeek === today) || null;
  }

  /**
   * Calculate macronutrient distribution
   */
  private calculateMacros(
    calories: number,
    goal: 'lose_weight' | 'maintain' | 'gain_muscle',
  ): { protein: number; carbs: number; fat: number } {
    let proteinPercent: number;
    let fatPercent: number;
    let carbPercent: number;

    switch (goal) {
      case 'lose_weight':
        proteinPercent = 0.35; // Higher protein for fat loss
        fatPercent = 0.25;
        carbPercent = 0.4;
        break;
      case 'gain_muscle':
        proteinPercent = 0.3; // High protein for muscle gain
        fatPercent = 0.25;
        carbPercent = 0.45; // Higher carbs for energy
        break;
      case 'maintain':
      default:
        proteinPercent = 0.3;
        fatPercent = 0.3;
        carbPercent = 0.4;
    }

    return {
      protein: Math.round((calories * proteinPercent) / 4), // 4 cal/g
      carbs: Math.round((calories * carbPercent) / 4), // 4 cal/g
      fat: Math.round((calories * fatPercent) / 9), // 9 cal/g
    };
  }

  /**
   * Generate daily meals based on target calories and macros
   */
  private generateDailyMeals(
    targetCalories: number,
    macros: { protein: number; carbs: number; fat: number },
  ): Meal[] {
    // Distribute calories: Breakfast 25%, Lunch 35%, Dinner 30%, Snacks 10%
    const calBreakfast = Math.round(targetCalories * 0.25);
    const calLunch = Math.round(targetCalories * 0.35);
    const calDinner = Math.round(targetCalories * 0.3);
    const calSnacks = Math.round(targetCalories * 0.1);

    return [
      {
        name: 'Breakfast',
        calories: calBreakfast,
        protein: Math.round(macros.protein * 0.25),
        carbs: Math.round(macros.carbs * 0.25),
        fat: Math.round(macros.fat * 0.25),
      },
      {
        name: 'Lunch',
        calories: calLunch,
        protein: Math.round(macros.protein * 0.35),
        carbs: Math.round(macros.carbs * 0.35),
        fat: Math.round(macros.fat * 0.35),
      },
      {
        name: 'Dinner',
        calories: calDinner,
        protein: Math.round(macros.protein * 0.3),
        carbs: Math.round(macros.carbs * 0.3),
        fat: Math.round(macros.fat * 0.3),
      },
      {
        name: 'Snacks',
        calories: calSnacks,
        protein: Math.round(macros.protein * 0.1),
        carbs: Math.round(macros.carbs * 0.1),
        fat: Math.round(macros.fat * 0.1),
      },
    ];
  }

  /**
   * Generate both workout and diet plans
   */
  async generateAllPlans(
    profile: UserProfile,
  ): Promise<{ workout: WorkoutPlan; diet: DietPlan }> {
    const [workout, diet] = await Promise.all([
      this.generateWorkoutPlan(profile),
      this.generateDietPlan(profile),
    ]);

    return { workout, diet };
  }

  // ========================
  // WORKOUT PLAN EDITING
  // ========================

  /**
   * Update an existing workout plan
   */
  async updateWorkoutPlan(plan: WorkoutPlan): Promise<void> {
    await this.storage.set(WORKOUT_PLAN_KEY, plan);
  }

  /**
   * Update a specific workout day
   */
  async updateWorkoutDay(dayOfWeek: number, day: WorkoutDay): Promise<void> {
    const plan = await this.getWorkoutPlan();
    if (!plan) {
      throw new Error('No workout plan found');
    }

    const dayIndex = plan.weeklyPlan.findIndex(
      (d) => d.dayOfWeek === dayOfWeek,
    );
    if (dayIndex === -1) {
      // Day doesn't exist, add it
      plan.weeklyPlan.push(day);
      // Sort by day of week so days appear in correct order
      plan.weeklyPlan.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    } else {
      // Update existing day
      plan.weeklyPlan[dayIndex] = day;
    }

    await this.updateWorkoutPlan(plan);
  }

  /**
   * Add an exercise to a specific day
   */
  async addExerciseToDay(dayOfWeek: number, exercise: Exercise): Promise<void> {
    const plan = await this.getWorkoutPlan();
    if (!plan) {
      throw new Error('No workout plan found');
    }

    const day = plan.weeklyPlan.find((d) => d.dayOfWeek === dayOfWeek);
    if (day) {
      day.exercises.push(exercise);
      await this.updateWorkoutPlan(plan);
    } else {
      throw new Error(`No workout found for day ${dayOfWeek}`);
    }
  }

  /**
   * Remove an exercise from a specific day
   */
  async removeExerciseFromDay(
    dayOfWeek: number,
    exerciseIndex: number,
  ): Promise<void> {
    const plan = await this.getWorkoutPlan();
    if (!plan) {
      throw new Error('No workout plan found');
    }

    const day = plan.weeklyPlan.find((d) => d.dayOfWeek === dayOfWeek);
    if (day) {
      day.exercises.splice(exerciseIndex, 1);
      await this.updateWorkoutPlan(plan);
    }
  }

  /**
   * Update an exercise in a specific day
   */
  async updateExerciseInDay(
    dayOfWeek: number,
    exerciseIndex: number,
    exercise: Exercise,
  ): Promise<void> {
    const plan = await this.getWorkoutPlan();
    if (!plan) {
      throw new Error('No workout plan found');
    }

    const day = plan.weeklyPlan.find((d) => d.dayOfWeek === dayOfWeek);
    if (day && day.exercises[exerciseIndex]) {
      day.exercises[exerciseIndex] = exercise;
      await this.updateWorkoutPlan(plan);
    }
  }

  /**
   * Reorder exercises in a day
   */
  async reorderExercises(
    dayOfWeek: number,
    exercises: Exercise[],
  ): Promise<void> {
    const plan = await this.getWorkoutPlan();
    if (!plan) {
      throw new Error('No workout plan found');
    }

    const day = plan.weeklyPlan.find((d) => d.dayOfWeek === dayOfWeek);
    if (day) {
      day.exercises = exercises;
      await this.updateWorkoutPlan(plan);
    }
  }

  /**
   * Delete a workout day
   */
  async deleteWorkoutDay(dayOfWeek: number): Promise<void> {
    const plan = await this.getWorkoutPlan();
    if (!plan) {
      throw new Error('No workout plan found');
    }

    plan.weeklyPlan = plan.weeklyPlan.filter((d) => d.dayOfWeek !== dayOfWeek);
    await this.updateWorkoutPlan(plan);
  }

  /**
   * Get workout for a specific day
   */
  async getWorkoutForDay(dayOfWeek: number): Promise<WorkoutDay | null> {
    const plan = await this.getWorkoutPlan();
    if (!plan) return null;

    return plan.weeklyPlan.find((day) => day.dayOfWeek === dayOfWeek) || null;
  }
}

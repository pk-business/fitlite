import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DailyNutritionLog, WeeklyNutritionSummary, NutritionSuggestion } from '../models/nutrition-tracking.model';
import { StorageService } from './storage.service';
import { UserProfile } from '../models';

const NUTRITION_LOGS_KEY = 'nutrition_logs';

@Injectable({
  providedIn: 'root'
})
export class NutritionTrackingService {
  private logsSubject = new BehaviorSubject<DailyNutritionLog[]>([]);
  public logs$: Observable<DailyNutritionLog[]> = this.logsSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadLogs();
  }

  /**
   * Load nutrition logs from storage
   */
  async loadLogs(): Promise<void> {
    try {
      const logs = await this.storage.get<DailyNutritionLog[]>(NUTRITION_LOGS_KEY) || [];
      this.logsSubject.next(logs);
    } catch (error) {
      console.error('Error loading nutrition logs:', error);
      this.logsSubject.next([]);
    }
  }

  /**
   * Save nutrition logs to storage
   */
  private async saveLogs(logs: DailyNutritionLog[]): Promise<void> {
    try {
      await this.storage.set(NUTRITION_LOGS_KEY, logs);
      this.logsSubject.next(logs);
    } catch (error) {
      console.error('Error saving nutrition logs:', error);
      throw error;
    }
  }

  /**
   * Get today's log or create a new one
   */
  getTodaysLog(userProfile: UserProfile): DailyNutritionLog {
    const today = new Date().toISOString().split('T')[0];
    const existingLogs = this.logsSubject.value;
    const todaysLog = existingLogs.find(log => log.date === today);

    if (todaysLog) {
      return todaysLog;
    }

    // Create new log with goals
    const waterGoal = this.calculateWaterGoal(userProfile);
    return {
      date: today,
      caloriesConsumed: 0,
      proteinConsumed: 0,
      carbsConsumed: 0,
      fatConsumed: 0,
      waterConsumed: 0,
      caloriesGoal: userProfile.recommendedCalories || 0,
      proteinGoal: userProfile.recommendedProtein || 0,
      carbsGoal: userProfile.recommendedCarbs || 0,
      fatGoal: userProfile.recommendedFat || 0,
      waterGoal: waterGoal,
      achievedCalories: false,
      achievedProtein: false,
      achievedCarbs: false,
      achievedFat: false,
      achievedWater: false
    };
  }

  /**
   * Update today's nutrition intake
   */
  async updateTodaysIntake(
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    water: number,
    userProfile: UserProfile
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const existingLogs = this.logsSubject.value;
    const logIndex = existingLogs.findIndex(log => log.date === today);

    const waterGoal = this.calculateWaterGoal(userProfile);
    const updatedLog: DailyNutritionLog = {
      date: today,
      caloriesConsumed: calories,
      proteinConsumed: protein,
      carbsConsumed: carbs,
      fatConsumed: fat,
      waterConsumed: water,
      caloriesGoal: userProfile.recommendedCalories || 0,
      proteinGoal: userProfile.recommendedProtein || 0,
      carbsGoal: userProfile.recommendedCarbs || 0,
      fatGoal: userProfile.recommendedFat || 0,
      waterGoal: waterGoal,
      achievedCalories: calories >= (userProfile.recommendedCalories || 0),
      achievedProtein: protein >= (userProfile.recommendedProtein || 0),
      achievedCarbs: carbs >= (userProfile.recommendedCarbs || 0),
      achievedFat: fat >= (userProfile.recommendedFat || 0),
      achievedWater: water >= waterGoal
    };

    if (logIndex >= 0) {
      existingLogs[logIndex] = updatedLog;
    } else {
      existingLogs.push(updatedLog);
    }

    await this.saveLogs(existingLogs);
  }

  /**
   * Calculate recommended water intake (35ml per kg body weight)
   */
  private calculateWaterGoal(userProfile: UserProfile): number {
    return userProfile.weightKg * 35; // 35ml per kg is a common recommendation
  }

  /**
   * Get logs for the last N days
   */
  getLogsForDays(days: number): DailyNutritionLog[] {
    const logs = this.logsSubject.value;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    return logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get weekly summary
   */
  getWeeklySummary(): WeeklyNutritionSummary | null {
    const logs = this.getLogsForDays(7);
    if (logs.length === 0) return null;

    const totalCalories = logs.reduce((sum, log) => sum + log.caloriesConsumed, 0);
    const totalProtein = logs.reduce((sum, log) => sum + log.proteinConsumed, 0);
    const totalCarbs = logs.reduce((sum, log) => sum + log.carbsConsumed, 0);
    const totalFat = logs.reduce((sum, log) => sum + log.fatConsumed, 0);
    const totalWater = logs.reduce((sum, log) => sum + log.waterConsumed, 0);

    const caloriesGoalMet = logs.filter(log => log.achievedCalories).length / logs.length * 100;
    const proteinGoalMet = logs.filter(log => log.achievedProtein).length / logs.length * 100;
    const carbsGoalMet = logs.filter(log => log.achievedCarbs).length / logs.length * 100;
    const fatGoalMet = logs.filter(log => log.achievedFat).length / logs.length * 100;
    const waterGoalMet = logs.filter(log => log.achievedWater).length / logs.length * 100;

    return {
      weekStart: logs[0]?.date || new Date().toISOString().split('T')[0],
      averageCalories: Math.round(totalCalories / logs.length),
      averageProtein: Math.round(totalProtein / logs.length),
      averageCarbs: Math.round(totalCarbs / logs.length),
      averageFat: Math.round(totalFat / logs.length),
      averageWater: Math.round(totalWater / logs.length),
      caloriesGoalMet: Math.round(caloriesGoalMet),
      proteinGoalMet: Math.round(proteinGoalMet),
      carbsGoalMet: Math.round(carbsGoalMet),
      fatGoalMet: Math.round(fatGoalMet),
      waterGoalMet: Math.round(waterGoalMet)
    };
  }

  /**
   * Generate personalized suggestions based on recent performance
   */
  getSuggestions(userProfile: UserProfile): NutritionSuggestion[] {
    const suggestions: NutritionSuggestion[] = [];
    const recentLogs = this.getLogsForDays(7);

    if (recentLogs.length < 3) {
      return [{
        type: 'general',
        message: 'Start tracking your daily nutrition to get personalized suggestions!',
        priority: 'medium',
        actionable: true
      }];
    }

    // Analyze calorie intake
    const avgCalories = recentLogs.reduce((sum, log) => sum + log.caloriesConsumed, 0) / recentLogs.length;
    const calorieGoal = userProfile.recommendedCalories || 0;
    const calorieVariance = Math.abs(avgCalories - calorieGoal) / calorieGoal;

    if (calorieVariance > 0.2) { // More than 20% variance
      if (avgCalories < calorieGoal) {
        suggestions.push({
          type: 'calories',
          message: `You're consuming ${Math.round(calorieGoal - avgCalories)} fewer calories than your goal. Consider adding healthy snacks or larger portions.`,
          priority: 'high',
          actionable: true
        });
      } else {
        suggestions.push({
          type: 'calories',
          message: `You're consuming ${Math.round(avgCalories - calorieGoal)} more calories than your goal. Focus on nutrient-dense foods.`,
          priority: 'medium',
          actionable: true
        });
      }
    }

    // Analyze protein intake
    const avgProtein = recentLogs.reduce((sum, log) => sum + log.proteinConsumed, 0) / recentLogs.length;
    const proteinGoal = userProfile.recommendedProtein || 0;

    if (avgProtein < proteinGoal * 0.8) {
      suggestions.push({
        type: 'protein',
        message: `Your protein intake is ${Math.round(proteinGoal - avgProtein)}g below target. Add lean meats, eggs, or protein supplements.`,
        priority: 'high',
        actionable: true
      });
    }

    // Analyze carbs intake
    const avgCarbs = recentLogs.reduce((sum, log) => sum + log.carbsConsumed, 0) / recentLogs.length;
    const carbsGoal = userProfile.recommendedCarbs || 0;

    if (avgCarbs < carbsGoal * 0.8) {
      suggestions.push({
        type: 'carbs',
        message: `Your carb intake is ${Math.round(carbsGoal - avgCarbs)}g below target. Consider adding whole grains, fruits, or vegetables.`,
        priority: 'medium',
        actionable: true
      });
    }

    // Analyze fat intake
    const avgFat = recentLogs.reduce((sum, log) => sum + log.fatConsumed, 0) / recentLogs.length;
    const fatGoal = userProfile.recommendedFat || 0;

    if (avgFat < fatGoal * 0.8) {
      suggestions.push({
        type: 'fat',
        message: `Your fat intake is ${Math.round(fatGoal - avgFat)}g below target. Include healthy fats like avocados, nuts, and olive oil.`,
        priority: 'medium',
        actionable: true
      });
    }

    // Analyze water intake
    const avgWater = recentLogs.reduce((sum, log) => sum + log.waterConsumed, 0) / recentLogs.length;
    const waterGoal = this.calculateWaterGoal(userProfile);

    if (avgWater < waterGoal * 0.7) {
      suggestions.push({
        type: 'water',
        message: `You're drinking ${Math.round((waterGoal - avgWater) / 1000 * 10) / 10}L less water than recommended. Stay hydrated for better performance!`,
        priority: 'medium',
        actionable: true
      });
    }

    // Success messages
    const recentSuccess = recentLogs.slice(-3).filter(log =>
      log.achievedCalories && log.achievedProtein && log.achievedCarbs && log.achievedFat && log.achievedWater
    ).length;

    if (recentSuccess >= 2) {
      suggestions.push({
        type: 'general',
        message: 'Great job hitting your nutrition goals recently! Keep up the excellent work!',
        priority: 'low',
        actionable: false
      });
    }

    return suggestions;
  }

  /**
   * Add a new nutrition log
   */
  async addLog(log: DailyNutritionLog): Promise<void> {
    const existingLogs = this.logsSubject.value;
    existingLogs.push(log);
    await this.saveLogs(existingLogs);
  }

  /**
   * Update an existing nutrition log
   */
  async updateLog(log: DailyNutritionLog): Promise<void> {
    const existingLogs = this.logsSubject.value;
    const index = existingLogs.findIndex(l => l.date === log.date);
    if (index >= 0) {
      existingLogs[index] = log;
      await this.saveLogs(existingLogs);
    } else {
      // If not found, add as new log
      existingLogs.push(log);
      await this.saveLogs(existingLogs);
    }
  }

  /**
   * Get log for a specific date
   */
  getLogForDate(date: string): DailyNutritionLog | null {
    const logs = this.logsSubject.value;
    return logs.find(log => log.date === date) || null;
  }
}
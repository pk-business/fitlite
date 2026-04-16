import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyNutritionLog } from '../models/nutrition-tracking.model';
import { NutritionTrackingService } from '../services/nutrition-tracking.service';
import { NutritionService } from '../services/nutrition.service';
import { UserProfileService } from '../services/user-profile.service';

/**
 * NutritionLogger allows users to log their daily nutrition intake
 * Track calories, protein, and water consumption
 */
@Component({
  selector: 'app-nutrition-logger',
  templateUrl: './nutrition-logger.component.html',
  styleUrls: ['./nutrition-logger.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class NutritionLoggerComponent implements OnInit {
  @Input() date: string = new Date().toISOString().split('T')[0];

  nutritionLog: Partial<DailyNutritionLog> = {
    date: this.date,
    caloriesConsumed: 0,
    proteinConsumed: 0,
    carbsConsumed: 0,
    fatConsumed: 0,
    waterConsumed: 0,
    caloriesGoal: 0,
    proteinGoal: 0,
    carbsGoal: 0,
    fatGoal: 0,
    waterGoal: 0,
    achievedCalories: false,
    achievedProtein: false,
    achievedCarbs: false,
    achievedFat: false,
    achievedWater: false
  };

  existingLog: DailyNutritionLog | null = null;
  isLoading = false;

  // Nutrition targets for reference
  targets = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  constructor(
    private modalCtrl: ModalController,
    private nutritionTrackingService: NutritionTrackingService,
    private nutritionService: NutritionService,
    private userProfileService: UserProfileService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.loadExistingLog();
    await this.loadTargets();
  }

  /**
   * Load existing nutrition log for this date if it exists
   */
  async loadExistingLog(): Promise<void> {
    await this.nutritionTrackingService.loadLogs();
    this.existingLog = this.nutritionTrackingService.getLogForDate(this.date);
    if (this.existingLog) {
      this.nutritionLog = { ...this.existingLog };
    }
  }

  /**
   * Load nutrition targets from user profile
   */
  async loadTargets(): Promise<void> {
    try {
      const profile = await this.userProfileService.loadProfile();
      if (profile) {
        const recommendations = this.nutritionService.getNutritionRecommendations(profile);
        this.targets = {
          calories: recommendations.calories,
          protein: recommendations.protein,
          carbs: recommendations.carbs,
          fat: recommendations.fat
        };
        // Set goals in the log
        this.nutritionLog.caloriesGoal = this.targets.calories;
        this.nutritionLog.proteinGoal = this.targets.protein;
        this.nutritionLog.carbsGoal = this.targets.carbs;
        this.nutritionLog.fatGoal = this.targets.fat;
        this.nutritionLog.waterGoal = 2000; // Default 2L water goal
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  /**
   * Save the nutrition log
   */
  async saveLog(): Promise<void> {
    this.isLoading = true;

    try {
      const logData: DailyNutritionLog = {
        id: this.existingLog?.id || `nutrition-${this.date}-${Date.now()}`,
        date: this.date,
        caloriesConsumed: this.nutritionLog.caloriesConsumed || 0,
        proteinConsumed: this.nutritionLog.proteinConsumed || 0,
        carbsConsumed: this.nutritionLog.carbsConsumed || 0,
        fatConsumed: this.nutritionLog.fatConsumed || 0,
        waterConsumed: this.nutritionLog.waterConsumed || 0,
        caloriesGoal: this.targets.calories,
        proteinGoal: this.targets.protein,
        carbsGoal: this.targets.carbs,
        fatGoal: this.targets.fat,
        waterGoal: 2000, // Default 2L water goal
        achievedCalories: (this.nutritionLog.caloriesConsumed || 0) >= this.targets.calories,
        achievedProtein: (this.nutritionLog.proteinConsumed || 0) >= this.targets.protein,
        achievedCarbs: (this.nutritionLog.carbsConsumed || 0) >= this.targets.carbs,
        achievedFat: (this.nutritionLog.fatConsumed || 0) >= this.targets.fat,
        achievedWater: (this.nutritionLog.waterConsumed || 0) >= 2000,
        loggedAt: new Date().toISOString()
      };

      if (this.existingLog) {
        await this.nutritionTrackingService.updateLog(logData);
        await this.showToast('Nutrition log updated successfully', 'success');
      } else {
        await this.nutritionTrackingService.addLog(logData);
        await this.showToast('Nutrition log saved successfully', 'success');
      }

      this.modalCtrl.dismiss({ saved: true });
    } catch (error) {
      console.error('Error saving nutrition log:', error);
      await this.showToast('Error saving nutrition log', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Calculate achievements based on targets
   */
  calculateAchievements(): string[] {
    const achievements: string[] = [];
    const calories = this.nutritionLog.caloriesConsumed || 0;
    const protein = this.nutritionLog.proteinConsumed || 0;
    const carbs = this.nutritionLog.carbsConsumed || 0;
    const fat = this.nutritionLog.fatConsumed || 0;
    const water = this.nutritionLog.waterConsumed || 0;

    // Only calculate achievements if targets are set
    if (this.targets.calories > 0) {
      if (calories >= this.targets.calories) {
        achievements.push('calorie_goal');
      }
      if (calories >= this.targets.calories * 0.9) {
        achievements.push('calorie_90_percent');
      }
    }

    if (this.targets.protein > 0) {
      if (protein >= this.targets.protein) {
        achievements.push('protein_goal');
      }
      if (protein >= this.targets.protein * 0.9) {
        achievements.push('protein_90_percent');
      }
    }

    if (this.targets.carbs > 0) {
      if (carbs >= this.targets.carbs) {
        achievements.push('carbs_goal');
      }
      if (carbs >= this.targets.carbs * 0.9) {
        achievements.push('carbs_90_percent');
      }
    }

    if (this.targets.fat > 0) {
      if (fat >= this.targets.fat) {
        achievements.push('fat_goal');
      }
      if (fat >= this.targets.fat * 0.9) {
        achievements.push('fat_90_percent');
      }
    }

    if (water >= 2000) {
      achievements.push('water_goal');
    }

    return achievements;
  }

  /**
   * Get human-readable achievement label
   */
  getAchievementLabel(achievement: string): string {
    const labels: { [key: string]: string } = {
      'calorie_goal': 'Calorie Goal Met!',
      'protein_goal': 'Protein Goal Met!',
      'carbs_goal': 'Carbs Goal Met!',
      'fat_goal': 'Fat Goal Met!',
      'water_goal': 'Hydration Goal Met!',
      'calorie_90_percent': '90% Calorie Goal',
      'protein_90_percent': '90% Protein Goal',
      'carbs_90_percent': '90% Carbs Goal',
      'fat_90_percent': '90% Fat Goal'
    };
    return labels[achievement] || achievement;
  }

  /**
   * Get calorie progress percentage
   */
  get calorieProgress(): number {
    if (this.targets.calories === 0) return 0;
    return Math.min((this.nutritionLog.caloriesConsumed || 0) / this.targets.calories * 100, 100);
  }

  /**
   * Get protein progress percentage
   */
  get proteinProgress(): number {
    if (this.targets.protein === 0) return 0;
    return Math.min((this.nutritionLog.proteinConsumed || 0) / this.targets.protein * 100, 100);
  }

  /**
   * Get carbs progress percentage
   */
  get carbsProgress(): number {
    if (this.targets.carbs === 0) return 0;
    return Math.min((this.nutritionLog.carbsConsumed || 0) / this.targets.carbs * 100, 100);
  }

  /**
   * Get fat progress percentage
   */
  get fatProgress(): number {
    if (this.targets.fat === 0) return 0;
    return Math.min((this.nutritionLog.fatConsumed || 0) / this.targets.fat * 100, 100);
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  /**
   * Close modal
   */
  close(): void {
    this.modalCtrl.dismiss();
  }
}

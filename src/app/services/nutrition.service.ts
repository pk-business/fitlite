import { Injectable } from '@angular/core';
import { UserProfile } from '../models/user-profile.model';

/**
 * NutritionService provides calculations for daily calorie and protein recommendations
 * based on user profile data using Mifflin-St Jeor equation and evidence-based guidelines.
 */
@Injectable({
  providedIn: 'root'
})
export class NutritionService {

  // Activity factors for TDEE calculation
  private readonly ACTIVITY_FACTORS = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  };

  // Protein recommendations per kg of body weight
  private readonly PROTEIN_RECOMMENDATIONS = {
    lose_weight: 1.8, // g/kg
    maintain: 1.4,     // g/kg
    gain_muscle: 1.6,  // g/kg
  };

  constructor() { }

  /**
   * Calculate BMR using Mifflin-St Jeor equation
   */
  calculateBMR(profile: UserProfile): number {
    const { age, gender, heightCm, weightKg } = profile;
    if (gender === 'male') {
      return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   */
  calculateTDEE(bmr: number, activityLevel: string): number {
    const factor = this.ACTIVITY_FACTORS[activityLevel as keyof typeof this.ACTIVITY_FACTORS];
    return bmr * factor;
  }

  /**
   * Calculate recommended daily calories based on goal
   */
  calculateRecommendedCalories(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    const tdee = this.calculateTDEE(bmr, profile.activityLevel);

    switch (profile.goal) {
      case 'lose_weight':
        return Math.round(tdee - 300);
      case 'maintain':
        return Math.round(tdee);
      case 'gain_muscle':
        return Math.round(tdee + 200);
      default:
        return Math.round(tdee); // Fallback to maintenance
    }
  }

  /**
   * Calculate recommended daily protein
   */
  calculateRecommendedProtein(profile: UserProfile): number {
    const factor = this.PROTEIN_RECOMMENDATIONS[profile.goal as keyof typeof this.PROTEIN_RECOMMENDATIONS];
    return Math.round(profile.weightKg * factor);
  }

  /**
   * Calculate recommended daily carbs (remaining calories after protein and fat)
   */
  calculateRecommendedCarbs(profile: UserProfile): number {
    const calories = this.calculateRecommendedCalories(profile);
    const protein = this.calculateRecommendedProtein(profile);
    const fat = this.calculateRecommendedFat(profile);
    
    // Carbs = (total calories - protein calories - fat calories) / 4
    const remainingCalories = calories - (protein * 4) - (fat * 9);
    return Math.round(remainingCalories / 4);
  }

  /**
   * Calculate recommended daily fat (25% of total calories)
   */
  calculateRecommendedFat(profile: UserProfile): number {
    const calories = this.calculateRecommendedCalories(profile);
    // Fat = 25% of total calories / 9 calories per gram
    return Math.round((calories * 0.25) / 9);
  }

  /**
   * Get nutrition recommendations for a user profile
   */
  getNutritionRecommendations(profile: UserProfile): { 
    calories: number; 
    protein: number; 
    carbs: number; 
    fat: number; 
  } {
    const calories = this.calculateRecommendedCalories(profile);
    const protein = this.calculateRecommendedProtein(profile);
    const carbs = this.calculateRecommendedCarbs(profile);
    const fat = this.calculateRecommendedFat(profile);
    return { calories, protein, carbs, fat };
  }

  /**
   * Update profile with calculated recommendations
   */
  updateProfileWithRecommendations(profile: UserProfile): UserProfile {
    const recommendations = this.getNutritionRecommendations(profile);
    return {
      ...profile,
      recommendedCalories: recommendations.calories,
      recommendedProtein: recommendations.protein,
      recommendedCarbs: recommendations.carbs,
      recommendedFat: recommendations.fat,
    };
  }
}
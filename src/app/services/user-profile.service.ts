import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProfile } from '../models';
import { StorageService } from './storage.service';

const USER_PROFILE_KEY = 'user_profile';

/**
 * UserProfileService manages user profile data
 * Provides observables for reactive UI updates
 */
@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  public profile$: Observable<UserProfile | null> = this.profileSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadProfile();
  }

  /**
   * Load user profile from storage
   */
  async loadProfile(): Promise<UserProfile | null> {
    try {
      const profile = await this.storage.get<UserProfile>(USER_PROFILE_KEY);
      this.profileSubject.next(profile);
      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  /**
   * Save user profile to storage
   * @param profile User profile data
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await this.storage.set(USER_PROFILE_KEY, profile);
      this.profileSubject.next(profile);
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  /**
   * Get current profile value (synchronous)
   */
  getCurrentProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  /**
   * Check if user profile exists
   */
  async hasProfile(): Promise<boolean> {
    const profile = await this.storage.get<UserProfile>(USER_PROFILE_KEY);
    return profile !== null;
  }

  /**
   * Delete user profile
   */
  async deleteProfile(): Promise<void> {
    try {
      await this.storage.remove(USER_PROFILE_KEY);
      this.profileSubject.next(null);
    } catch (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }
  }

  /**
   * Calculate BMI (Body Mass Index)
   * @param profile User profile
   * @returns BMI value
   */
  calculateBMI(profile: UserProfile): number {
    const heightM = profile.heightCm / 100;
    return profile.weightKg / (heightM * heightM);
  }

  /**
   * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
   * @param profile User profile
   * @returns BMR value (calories per day)
   */
  calculateBMR(profile: UserProfile): number {
    const { weightKg, heightCm, age, gender } = profile;
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    
    if (gender === 'male') {
      bmr += 5;
    } else if (gender === 'female') {
      bmr -= 161;
    } else {
      bmr -= 78; // Average for 'other'
    }
    
    return Math.round(bmr);
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   * @param profile User profile
   * @returns TDEE value (calories per day)
   */
  calculateTDEE(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    const activityMultipliers = {
      low: 1.2,      // Sedentary
      medium: 1.55,  // Moderately active
      high: 1.9      // Very active
    };
    
    return Math.round(bmr * activityMultipliers[profile.activityLevel]);
  }

  /**
   * Calculate target daily calories based on user goal
   * @param profile User profile
   * @returns Target calories per day
   */
  calculateTargetCalories(profile: UserProfile): number {
    const tdee = this.calculateTDEE(profile);
    
    switch (profile.goal) {
      case 'lose':
        return Math.round(tdee - 500); // 500 calorie deficit for ~0.5kg/week loss
      case 'gain':
        return Math.round(tdee + 300); // 300 calorie surplus for lean muscle gain
      case 'maintain':
      default:
        return tdee;
    }
  }
}

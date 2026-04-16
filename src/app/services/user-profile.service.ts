import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProfile } from '../models';
import { StorageService } from './storage.service';
import { NutritionService } from './nutrition.service';

const USER_PROFILE_KEY = 'user_profile';

/**
 * UserProfileService manages user profile data
 * Provides observables for reactive UI updates
 */
@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  public profile$: Observable<UserProfile | null> =
    this.profileSubject.asObservable();

  constructor(
    private storage: StorageService,
    private nutritionService: NutritionService,
  ) {
    this.loadProfile();
  }

  /**
   * Load user profile from storage
   */
  async loadProfile(): Promise<UserProfile | null> {
    try {
      const profile = await this.storage.get<UserProfile>(USER_PROFILE_KEY);
      if (profile) {
        // Ensure nutrition recommendations are up to date
        const updatedProfile =
          this.nutritionService.updateProfileWithRecommendations(profile);
        this.profileSubject.next(updatedProfile);
        return updatedProfile;
      }
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
      // Calculate nutrition recommendations
      const updatedProfile =
        this.nutritionService.updateProfileWithRecommendations(profile);
      await this.storage.set(USER_PROFILE_KEY, updatedProfile);
      this.profileSubject.next(updatedProfile);
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
}

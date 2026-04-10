import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';
import { StorageService } from './storage.service';
import { Reminder, AppSettings } from '../models';

const REMINDERS_KEY = 'reminders';
const SETTINGS_KEY = 'app_settings';

// Notification IDs
const WORKOUT_REMINDER_ID = 1;
const BREAKFAST_REMINDER_ID = 2;
const LUNCH_REMINDER_ID = 3;
const DINNER_REMINDER_ID = 4;

/**
 * ScheduleService manages workout and meal reminders
 * Coordinates between NotificationService and StorageService
 */
@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(
    private notificationService: NotificationService,
    private storage: StorageService
  ) {}

  /**
   * Initialize default schedules if not already set
   */
  async initializeDefaultSchedule(): Promise<void> {
    const settings = await this.getSettings();
    
    if (!settings.workoutReminderTime) {
      // Default workout reminder: 7:00 AM
      await this.setWorkoutReminder(7, 0);
    }

    if (!settings.mealReminderTimes || settings.mealReminderTimes.length === 0) {
      // Default meal reminders
      await this.setMealReminders([
        { hour: 8, minute: 0 },  // Breakfast
        { hour: 13, minute: 0 }, // Lunch
        { hour: 19, minute: 0 }  // Dinner
      ]);
    }
  }

  /**
   * Set workout reminder time
   * @param hour Hour (0-23)
   * @param minute Minute (0-59)
   */
  async setWorkoutReminder(hour: number, minute: number): Promise<void> {
    try {
      // Cancel existing workout reminder
      await this.notificationService.cancel(WORKOUT_REMINDER_ID);

      // Schedule new reminder
      await this.notificationService.scheduleDailyReminder(
        WORKOUT_REMINDER_ID,
        'Time to Work Out! 💪',
        'Complete your workout for today',
        hour,
        minute
      );

      // Update settings
      const settings = await this.getSettings();
      settings.workoutReminderTime = { hour, minute };
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Error setting workout reminder:', error);
      throw error;
    }
  }

  /**
   * Set meal reminder times
   * @param times Array of meal reminder times
   */
  async setMealReminders(times: { hour: number; minute: number }[]): Promise<void> {
    try {
      const mealIds = [BREAKFAST_REMINDER_ID, LUNCH_REMINDER_ID, DINNER_REMINDER_ID];
      const mealNames = ['Breakfast', 'Lunch', 'Dinner'];
      const mealEmojis = ['🍳', '🍱', '🍽️'];

      // Cancel existing meal reminders
      await this.notificationService.cancelMultiple(mealIds);

      // Schedule new reminders
      for (let i = 0; i < Math.min(times.length, 3); i++) {
        await this.notificationService.scheduleDailyReminder(
          mealIds[i],
          `${mealNames[i]} Time! ${mealEmojis[i]}`,
          `Don't forget your ${mealNames[i].toLowerCase()}`,
          times[i].hour,
          times[i].minute
        );
      }

      // Update settings
      const settings = await this.getSettings();
      settings.mealReminderTimes = times;
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Error setting meal reminders:', error);
      throw error;
    }
  }

  /**
   * Disable workout reminder
   */
  async disableWorkoutReminder(): Promise<void> {
    try {
      await this.notificationService.cancel(WORKOUT_REMINDER_ID);
      
      const settings = await this.getSettings();
      delete settings.workoutReminderTime;
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Error disabling workout reminder:', error);
      throw error;
    }
  }

  /**
   * Disable all meal reminders
   */
  async disableMealReminders(): Promise<void> {
    try {
      const mealIds = [BREAKFAST_REMINDER_ID, LUNCH_REMINDER_ID, DINNER_REMINDER_ID];
      await this.notificationService.cancelMultiple(mealIds);
      
      const settings = await this.getSettings();
      settings.mealReminderTimes = [];
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Error disabling meal reminders:', error);
      throw error;
    }
  }

  /**
   * Disable all reminders
   */
  async disableAllReminders(): Promise<void> {
    try {
      await this.notificationService.cancelAll();
      
      const settings = await this.getSettings();
      delete settings.workoutReminderTime;
      settings.mealReminderTimes = [];
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Error disabling all reminders:', error);
      throw error;
    }
  }

  /**
   * Get current app settings
   */
  async getSettings(): Promise<AppSettings> {
    const settings = await this.storage.get<AppSettings>(SETTINGS_KEY);
    
    if (!settings) {
      // Return default settings
      return {
        useMetricUnits: false,
        theme: 'auto',
        mealReminderTimes: []
      };
    }
    
    return settings;
  }

  /**
   * Save app settings
   */
  private async saveSettings(settings: AppSettings): Promise<void> {
    await this.storage.set(SETTINGS_KEY, settings);
  }

  /**
   * Update app settings
   */
  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await this.saveSettings(updatedSettings);
  }

  /**
   * Get all pending reminders
   */
  async getPendingReminders(): Promise<any[]> {
    return await this.notificationService.getPendingNotifications();
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    return await this.notificationService.requestPermission();
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    return await this.notificationService.checkPermissions();
  }
}

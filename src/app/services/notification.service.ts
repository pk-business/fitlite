import { Injectable } from '@angular/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

/**
 * NotificationService handles local notification scheduling and management
 * using Capacitor Local Notifications plugin
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() {}

  /**
   * Request notification permissions from the user
   * @returns Permission status
   */
  async requestPermission(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check current notification permission status
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }

  /**
   * Schedule a daily repeating reminder
   * @param id Unique notification ID
   * @param title Notification title
   * @param body Notification body text
   * @param hour Hour (0-23)
   * @param minute Minute (0-59)
   */
  async scheduleDailyReminder(
    id: number,
    title: string,
    body: string,
    hour: number,
    minute: number
  ): Promise<void> {
    try {
      // Ensure permissions are granted
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error('Notification permission not granted');
        }
      }

      // Create schedule date
      const now = new Date();
      const scheduleDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0
      );

      // If time has passed today, schedule for tomorrow
      if (scheduleDate <= now) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      const options: ScheduleOptions = {
        notifications: [
          {
            id,
            title,
            body,
            schedule: {
              at: scheduleDate,
              every: 'day'
            },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      };

      await LocalNotifications.schedule(options);
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      throw error;
    }
  }

  /**
   * Schedule multiple reminders at once
   * @param reminders Array of reminder configurations
   */
  async scheduleMultipleReminders(
    reminders: Array<{
      id: number;
      title: string;
      body: string;
      hour: number;
      minute: number;
    }>
  ): Promise<void> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions) {
        await this.requestPermission();
      }

      for (const reminder of reminders) {
        await this.scheduleDailyReminder(
          reminder.id,
          reminder.title,
          reminder.body,
          reminder.hour,
          reminder.minute
        );
      }
    } catch (error) {
      console.error('Error scheduling multiple reminders:', error);
      throw error;
    }
  }

  /**
   * Cancel a specific notification
   * @param id Notification ID to cancel
   */
  async cancel(id: number): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel multiple notifications
   * @param ids Array of notification IDs to cancel
   */
  async cancelMultiple(ids: number[]): Promise<void> {
    try {
      const notifications = ids.map(id => ({ id }));
      await LocalNotifications.cancel({ notifications });
    } catch (error) {
      console.error('Error cancelling notifications:', error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAll(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }

  /**
   * Get list of pending notifications
   */
  async getPendingNotifications(): Promise<any[]> {
    try {
      const result = await LocalNotifications.getPending();
      return result.notifications;
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }
}

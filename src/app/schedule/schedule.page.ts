import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { AppSettings } from '../models';
import { AlertController, ToastController, IonicModule } from '@ionic/angular';


/**
 * SchedulePage allows users to manage workout and meal reminders
 */
@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.page.html',
    styleUrls: ['./schedule.page.scss'],
    imports: [IonicModule]
})
export class SchedulePage implements OnInit {
  settings: AppSettings | null = null;
  notificationsEnabled = false;
  isLoading = true;

  constructor(
    private scheduleService: ScheduleService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadSettings();
  }

  /**
   * Load current settings and check notification permissions
   */
  async loadSettings(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      this.settings = await this.scheduleService.getSettings();
      this.notificationsEnabled = await this.scheduleService.areNotificationsEnabled();
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<void> {
    const granted = await this.scheduleService.requestPermissions();
    this.notificationsEnabled = granted;
    this.cdr.markForCheck();

    if (granted) {
      await this.showToast('Notifications enabled successfully!', 'success');
    } else {
      await this.showToast('Permission denied. Please enable in settings.', 'warning');
    }
  }

  /**
   * Set workout reminder time
   */
  async setWorkoutReminder(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Workout Reminder',
      message: 'Set your daily workout reminder time',
      inputs: [
        {
          name: 'hour',
          type: 'number',
          placeholder: 'Hour (0-23)',
          min: 0,
          max: 23,
          value: this.settings?.workoutReminderTime?.hour || 7
        },
        {
          name: 'minute',
          type: 'number',
          placeholder: 'Minute (0-59)',
          min: 0,
          max: 59,
          value: this.settings?.workoutReminderTime?.minute || 0
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Set',
          handler: async (data) => {
            const hour = parseInt(data.hour, 10);
            const minute = parseInt(data.minute, 10);

            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
              try {
                await this.scheduleService.setWorkoutReminder(hour, minute);
                await this.loadSettings();
                await this.showToast('Workout reminder set!', 'success');
              } catch (error) {
                await this.showToast('Error setting reminder', 'danger');
              }
            } else {
              await this.showToast('Invalid time entered', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Set meal reminder times
   */
  async setMealReminders(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Meal Reminders',
      message: 'Set times for Breakfast, Lunch, and Dinner',
      inputs: [
        {
          name: 'breakfast',
          type: 'time',
          value: this.formatTimeInput(8, 0)
        },
        {
          name: 'lunch',
          type: 'time',
          value: this.formatTimeInput(13, 0)
        },
        {
          name: 'dinner',
          type: 'time',
          value: this.formatTimeInput(19, 0)
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Set',
          handler: async (data) => {
            try {
              const times = [
                this.parseTimeInput(data.breakfast),
                this.parseTimeInput(data.lunch),
                this.parseTimeInput(data.dinner)
              ];

              await this.scheduleService.setMealReminders(times);
              await this.loadSettings();
              await this.showToast('Meal reminders set!', 'success');
            } catch (error) {
              await this.showToast('Error setting reminders', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Disable workout reminder
   */
  async disableWorkoutReminder(): Promise<void> {
    try {
      await this.scheduleService.disableWorkoutReminder();
      await this.loadSettings();
      await this.showToast('Workout reminder disabled', 'success');
    } catch (error) {
      await this.showToast('Error disabling reminder', 'danger');
    }
  }

  /**
   * Disable meal reminders
   */
  async disableMealReminders(): Promise<void> {
    try {
      await this.scheduleService.disableMealReminders();
      await this.loadSettings();
      await this.showToast('Meal reminders disabled', 'success');
    } catch (error) {
      await this.showToast('Error disabling reminders', 'danger');
    }
  }

  /**
   * Format time for input field (HH:mm)
   */
  private formatTimeInput(hour: number, minute: number): string {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  /**
   * Parse time input (HH:mm) to hour and minute
   */
  private parseTimeInput(timeString: string): { hour: number; minute: number } {
    const [hour, minute] = timeString.split(':').map(n => parseInt(n, 10));
    return { hour, minute };
  }

  /**
   * Format time for display
   */
  formatTime(hour: number, minute: number): string {
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    const period = hour < 12 ? 'AM' : 'PM';
    return `${h}:${m} ${period}`;
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
   * Get workout reminder display text
   */
  get workoutReminderText(): string {
    if (!this.settings?.workoutReminderTime) {
      return 'Not set';
    }
    return this.formatTime(
      this.settings.workoutReminderTime.hour,
      this.settings.workoutReminderTime.minute
    );
  }

  /**
   * Get meal reminders display text
   */
  get mealRemindersText(): string {
    if (!this.settings?.mealReminderTimes || this.settings.mealReminderTimes.length === 0) {
      return 'Not set';
    }
    return `${this.settings.mealReminderTimes.length} times set`;
  }
}

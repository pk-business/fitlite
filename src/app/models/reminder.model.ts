/**
 * Reminder model for scheduling notifications
 */
export interface Reminder {
  id: number;
  title: string;
  body: string;
  hour: number; // 0-23
  minute: number; // 0-59
  enabled: boolean;
}

/**
 * App settings model
 */
export interface AppSettings {
  workoutReminderTime?: { hour: number; minute: number };
  mealReminderTimes?: { hour: number; minute: number }[];
  useMetricUnits: boolean;
  theme: 'light' | 'dark' | 'auto';
}

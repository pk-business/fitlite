/**
 * Date utility functions for consistent date handling across the app
 */

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current day of week (0-6, Sunday-Saturday)
 */
export function getTodayDayOfWeek(): number {
  return new Date().getDay();
}

/**
 * Format a date to ISO date string
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Get date N days ago as ISO string
 */
export function daysAgoISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODate(date);
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayISO();
}

/**
 * Get day name from day of week number
 */
export function getDayName(dayOfWeek: number, short = false): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return short ? shortDays[dayOfWeek] : days[dayOfWeek];
}

/**
 * Format relative time (e.g., "2h ago", "Yesterday")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return toISODate(new Date(timestamp));
}

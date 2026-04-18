/**
 * Format utility functions for consistent formatting across the app
 */

/**
 * Format seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to hours:minutes:seconds (HH:MM:SS)
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format number with commas (e.g., 1,234,567)
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format calories (e.g., "1,234 kcal")
 */
export function formatCalories(calories: number): string {
  return `${formatNumber(Math.round(calories))} kcal`;
}

/**
 * Format weight with unit
 */
export function formatWeight(weight: number, useMetric: boolean): string {
  if (useMetric) {
    return `${weight.toFixed(1)} kg`;
  }
  return `${(weight * 2.205).toFixed(1)} lbs`;
}

/**
 * Format height
 */
export function formatHeight(heightCm: number, useMetric: boolean): string {
  if (useMetric) {
    return `${heightCm} cm`;
  }
  const inches = heightCm / 2.54;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}'${remainingInches}"`;
}

/**
 * Format percentage (e.g., "85%")
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Clamp percentage to 0-100 range
 */
export function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert snake_case or kebab-case to Title Case
 */
export function toTitleCase(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

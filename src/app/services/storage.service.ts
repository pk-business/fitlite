import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

/**
 * StorageService provides a simple wrapper around Capacitor Preferences API
 * for storing and retrieving data locally on the device
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  /**
   * Store data in local storage
   * @param key Storage key
   * @param value Value to store (will be JSON stringified)
   */
  async set(key: string, value: any): Promise<void> {
    try {
      await Preferences.set({
        key,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error(`Error setting storage key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve data from local storage
   * @param key Storage key
   * @returns Parsed value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting storage key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a specific key from storage
   * @param key Storage key to remove
   */
  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error(`Error removing storage key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

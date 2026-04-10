import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * Theme type definition
 */
export type ThemeType = 'light' | 'dark';

/**
 * ThemeService manages light and dark theme system
 * 
 * Themes are applied via class on document root
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  
  private readonly THEME_STORAGE_KEY = 'app_theme';
  private currentTheme: ThemeType = 'light';

  constructor(private storage: StorageService) {
    this.loadSavedTheme();
  }

  /**
   * Load saved theme from storage on app init
   */
  private async loadSavedTheme(): Promise<void> {
    try {
      const savedTheme = await this.storage.get<ThemeType>(this.THEME_STORAGE_KEY);
      if (savedTheme) {
        this.applyTheme(savedTheme, false);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.applyTheme(prefersDark ? 'dark' : 'light', false);
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }
  }

  /**
   * Apply theme to the app
   * @param theme Theme to apply ('light' or 'dark')
   * @param save Whether to save to storage (default: true)
   */
  applyTheme(theme: ThemeType, save: boolean = true): void {
    // Remove existing theme class
    document.body.classList.remove('dark');
    
    // Add new theme
    if (theme === 'dark') {
      document.body.classList.add('dark');
    }
    this.currentTheme = theme;

    // Save to storage
    if (save) {
      this.storage.set(this.THEME_STORAGE_KEY, theme);
    }

    console.log(`Theme applied: ${theme}`);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme: ThemeType = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): ThemeType {
    return this.currentTheme;
  }

  /**
   * Check if current theme is dark
   */
  isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  /**
   * Get theme display name
   */
  getThemeName(theme?: ThemeType): string {
    const t = theme || this.currentTheme;
    return t === 'light' ? 'Light' : 'Dark';
  }

  /**
   * Get theme description
   */
  getThemeDescription(theme?: ThemeType): string {
    const t = theme || this.currentTheme;
    return t === 'light' 
      ? 'Bright and clear interface' 
      : 'Easy on the eyes in low light';
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): Array<{ value: ThemeType; name: string; description: string }> {
    return [
      {
        value: 'light',
        name: 'Light',
        description: 'Bright and clear interface'
      },
      {
        value: 'dark',
        name: 'Dark',
        description: 'Easy on the eyes in low light'
      }
    ];
  }
}

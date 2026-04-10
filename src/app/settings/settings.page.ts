import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AlertController, ToastController, IonicModule, ActionSheetController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { UserProfileService } from '../services/user-profile.service';
import { ScheduleService } from '../services/schedule.service';
import { ThemeService, ThemeType } from '../services/theme.service';
import { AppSettings, UserProfile } from '../models';
import { TitleCasePipe } from '@angular/common';

/**
 * SettingsPage allows users to manage app settings and data
 */
@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
    imports: [IonicModule, TitleCasePipe, RouterLink]
})
export class SettingsPage implements OnInit {
  settings: AppSettings | null = null;
  userProfile: UserProfile | null = null;
  appVersion = '1.0.0';

  constructor(
    private storageService: StorageService,
    private userProfileService: UserProfileService,
    private scheduleService: ScheduleService,
    private themeService: ThemeService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  /**
   * Load settings and profile data
   */
  async loadData(): Promise<void> {
    try {
      this.settings = await this.scheduleService.getSettings();
      this.userProfile = await this.userProfileService.loadProfile();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Navigate to profile editor
   */
  editProfile(): void {
    this.router.navigate(['/profile']);
  }

  /**
   * Navigate to schedule page
   */
  manageReminders(): void {
    this.router.navigate(['/schedule']);
  }

  /**
   * Get current theme name for display
   */
  get currentThemeName(): string {
    return this.themeService.getThemeName();
  }

  /**
   * Open theme selector action sheet
   */
  async openThemeSelector(): Promise<void> {
    const themes = this.themeService.getAvailableThemes();
    const currentTheme = this.themeService.getCurrentTheme();

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select App Theme',
      buttons: [
        ...themes.map(theme => ({
          text: theme.name,
          icon: currentTheme === theme.value ? 'checkmark-circle' : 'ellipse-outline',
          cssClass: currentTheme === theme.value ? 'action-sheet-selected' : '',
          handler: () => {
            this.selectTheme(theme.value);
          }
        })),
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  /**
   * Select and apply a theme
   */
  async selectTheme(theme: ThemeType): Promise<void> {
    this.themeService.applyTheme(theme);
    
    // Update user profile if needed
    if (this.userProfile) {
      this.userProfile.theme = theme;
      await this.userProfileService.saveProfile(this.userProfile);
    }

    await this.showToast(`Theme changed to ${this.themeService.getThemeName(theme)}`, 'success');
    this.cdr.markForCheck();
  }

  /**
   * Toggle metric/imperial units
   */
  async toggleUnits(event: any): Promise<void> {
    const useMetric = event.detail.checked;
    
    if (this.settings) {
      this.settings.useMetricUnits = useMetric;
      await this.scheduleService.updateSettings({ useMetricUnits: useMetric });
      await this.showToast(`Units changed to ${useMetric ? 'Metric' : 'Imperial'}`, 'success');
    }
  }

  /**
   * Reset all app data
   */
  async resetAllData(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Reset All Data',
      message: 'Are you sure you want to delete all your data? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          role: 'destructive',
          handler: async () => {
            try {
              // Clear all storage
              await this.storageService.clear();
              
              // Cancel all notifications
              await this.scheduleService.disableAllReminders();
              
              await this.showToast('All data has been reset', 'success');
              
              // Navigate to profile page
              this.router.navigate(['/profile']);
            } catch (error) {
              console.error('Error resetting data:', error);
              await this.showToast('Error resetting data', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Export user data (for backup)
   */
  async exportData(): Promise<void> {
    try {
      const data = {
        profile: this.userProfile,
        settings: this.settings,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(data, null, 2);
      
      // In a real app, you would use Capacitor Filesystem to save this
      // For now, just copy to clipboard or show alert
      const alert = await this.alertCtrl.create({
        header: 'Export Data',
        message: 'Your data has been prepared. In a full implementation, this would be saved to a file.',
        buttons: ['OK']
      });
      
      await alert.present();
      console.log('Exported data:', dataStr);
      
      await this.showToast('Data export prepared', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      await this.showToast('Error exporting data', 'danger');
    }
  }

  /**
   * Show about/help information
   */
  async showAbout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'About FitLite',
      message: `
        <p><strong>Version:</strong> ${this.appVersion}</p>
        <p><strong>FitLite</strong> is a lightweight fitness app that helps you achieve your fitness goals with personalized workout and diet plans.</p>
        <p>Built with Angular, Ionic, and Capacitor.</p>
      `,
      buttons: ['OK']
    });

    await alert.present();
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
   * Get BMI if profile exists
   */
  get userBMI(): string {
    if (!this.userProfile) return '--';
    
    const bmi = this.userProfileService.calculateBMI(this.userProfile);
    return bmi.toFixed(1);
  }

  /**
   * Get target calories if profile exists
   */
  get targetCalories(): number {
    if (!this.userProfile) return 0;
    
    return this.userProfileService.calculateTargetCalories(this.userProfile);
  }
}

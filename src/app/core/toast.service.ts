import { Injectable, inject } from '@angular/core';
import { ToastController, ToastOptions } from '@ionic/angular';

/**
 * Predefined toast types with consistent styling
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * ToastService provides a simplified API for showing toast notifications
 * 
 * Usage:
 *   await this.toast.success('Item saved!');
 *   await this.toast.error('Failed to load data');
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastCtrl = inject(ToastController);

  private readonly DEFAULT_DURATION = 2500;

  private readonly TYPE_CONFIG: Record<ToastType, { color: string; icon: string }> = {
    success: { color: 'success', icon: 'checkmark-circle-outline' },
    error: { color: 'danger', icon: 'alert-circle-outline' },
    warning: { color: 'warning', icon: 'warning-outline' },
    info: { color: 'primary', icon: 'information-circle-outline' }
  };

  /**
   * Show a success toast
   */
  async success(message: string, duration = this.DEFAULT_DURATION): Promise<void> {
    await this.show(message, 'success', duration);
  }

  /**
   * Show an error toast
   */
  async error(message: string, duration = 3500): Promise<void> {
    await this.show(message, 'error', duration);
  }

  /**
   * Show a warning toast
   */
  async warning(message: string, duration = this.DEFAULT_DURATION): Promise<void> {
    await this.show(message, 'warning', duration);
  }

  /**
   * Show an info toast
   */
  async info(message: string, duration = this.DEFAULT_DURATION): Promise<void> {
    await this.show(message, 'info', duration);
  }

  /**
   * Show a toast with custom options
   */
  async custom(options: ToastOptions): Promise<void> {
    const toast = await this.toastCtrl.create(options);
    await toast.present();
  }

  /**
   * Show toast with type
   */
  private async show(message: string, type: ToastType, duration: number): Promise<void> {
    const config = this.TYPE_CONFIG[type];
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom',
      color: config.color,
      icon: config.icon,
      cssClass: `toast-${type}`
    });
    await toast.present();
  }
}

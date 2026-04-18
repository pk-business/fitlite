import { Injectable, ErrorHandler, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

/**
 * Application error types for categorization
 */
export type AppErrorType = 
  | 'storage'
  | 'network'
  | 'validation'
  | 'permission'
  | 'unknown';

/**
 * Structured application error
 */
export interface AppError {
  type: AppErrorType;
  message: string;
  userMessage: string;
  originalError?: unknown;
  timestamp: number;
}

/**
 * ErrorService provides centralized error handling with user feedback
 * 
 * Usage:
 *   try {
 *     await someOperation();
 *   } catch (error) {
 *     this.errorService.handleError(error, 'storage', 'Failed to save data');
 *   }
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private toastCtrl = inject(ToastController);
  
  /** Recent errors for debugging (limited to last 50) */
  private errorLog: AppError[] = [];
  private readonly MAX_LOG_SIZE = 50;

  /**
   * Handle an error with optional user notification
   * @param error The caught error
   * @param type Error category
   * @param userMessage Optional user-friendly message (if not provided, a default is shown)
   * @param showToast Whether to show a toast notification (default: true)
   */
  async handleError(
    error: unknown,
    type: AppErrorType = 'unknown',
    userMessage?: string,
    showToast = true
  ): Promise<void> {
    const appError = this.createAppError(error, type, userMessage);
    
    // Log to console in development
    console.error(`[${type.toUpperCase()}]`, appError.message, error);
    
    // Add to error log
    this.addToLog(appError);
    
    // Show user notification
    if (showToast) {
      await this.showErrorToast(appError.userMessage);
    }
  }

  /**
   * Handle error silently (log only, no user notification)
   */
  handleSilent(error: unknown, type: AppErrorType = 'unknown'): void {
    const appError = this.createAppError(error, type);
    console.error(`[${type.toUpperCase()}] (silent)`, appError.message, error);
    this.addToLog(appError);
  }

  /**
   * Get recent error log for debugging
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Create structured app error from any error
   */
  private createAppError(
    error: unknown,
    type: AppErrorType,
    userMessage?: string
  ): AppError {
    let message = 'An unknown error occurred';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String((error as any).message);
    }

    return {
      type,
      message,
      userMessage: userMessage ?? this.getDefaultUserMessage(type),
      originalError: error,
      timestamp: Date.now()
    };
  }

  /**
   * Get default user-friendly message for error type
   */
  private getDefaultUserMessage(type: AppErrorType): string {
    const messages: Record<AppErrorType, string> = {
      storage: 'Unable to save data. Please try again.',
      network: 'Network error. Please check your connection.',
      validation: 'Invalid input. Please check your data.',
      permission: 'Permission denied. Please grant the required permissions.',
      unknown: 'Something went wrong. Please try again.'
    };
    return messages[type];
  }

  /**
   * Show error toast notification
   */
  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      icon: 'alert-circle-outline',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Add error to log, maintaining max size
   */
  private addToLog(error: AppError): void {
    this.errorLog.unshift(error);
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog.pop();
    }
  }
}

/**
 * Global error handler that integrates with ErrorService
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private errorService = inject(ErrorService);

  handleError(error: unknown): void {
    this.errorService.handleError(error, 'unknown', undefined, true);
  }
}

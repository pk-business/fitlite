import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyNutritionLog } from '../../models/nutrition-tracking.model';
import { NutritionTrackingService } from '../../services/nutrition-tracking.service';

/**
 * EditNutritionLogsComponent lets users edit the last 5 nutrition logs
 */
@Component({
  selector: 'app-edit-nutrition-logs',
  templateUrl: './edit-nutrition-logs.component.html',
  styleUrls: ['./edit-nutrition-logs.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EditNutritionLogsComponent implements OnInit {
  logs: DailyNutritionLog[] = [];
  isSaving = false;

  constructor(
    private modalCtrl: ModalController,
    private nutritionTrackingService: NutritionTrackingService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    // Get last 5 logs, most recent first
    const all = this.nutritionTrackingService.getLogsForDays(30);
    this.logs = [...all].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    this.cdr.markForCheck();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  async save(log: DailyNutritionLog): Promise<void> {
    this.isSaving = true;
    try {
      // Recalculate achievements
      log.achievedCalories = log.caloriesConsumed >= log.caloriesGoal;
      log.achievedProtein = log.proteinConsumed >= log.proteinGoal;
      log.achievedCarbs = log.carbsConsumed >= log.carbsGoal;
      log.achievedFat = log.fatConsumed >= log.fatGoal;
      log.achievedWater = log.waterConsumed >= log.waterGoal;

      await this.nutritionTrackingService.updateLog(log);

      const toast = await this.toastCtrl.create({
        message: `Updated ${this.formatDate(log.date)}`,
        duration: 1500,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    } catch (err) {
      const toast = await this.toastCtrl.create({
        message: 'Failed to save changes',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isSaving = false;
      this.cdr.markForCheck();
    }
  }

  dismiss(): void {
    this.modalCtrl.dismiss({ refreshNeeded: true });
  }
}

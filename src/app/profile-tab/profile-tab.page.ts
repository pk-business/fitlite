import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../models';
import { UserProfileService } from '../services/user-profile.service';
import { DataTransferService } from '../services/data-transfer.service';

@Component({
  selector: 'app-profile-tab',
  templateUrl: 'profile-tab.page.html',
  styleUrls: ['profile-tab.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ProfileTabPage implements OnInit {
  isLoading = true;
  userProfile: UserProfile | null = null;
  isExporting = false;
  isImporting = false;

  constructor(
    private userProfileService: UserProfileService,
    private router: Router,
    private alertCtrl: AlertController,
    private dataTransfer: DataTransferService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    await this.loadProfile();
  }

  ionViewWillEnter() {
    this.loadProfile();
  }

  async loadProfile() {
    this.isLoading = true;
    this.cdr.markForCheck();
    try {
      this.userProfile = await this.userProfileService.loadProfile();
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  editProfile() {
    this.router.navigate(['/profile']);
  }

  openSettings() {
    this.router.navigate(['/settings']);
  }

  getBmi(profile: UserProfile): number {
    const h = profile.heightCm / 100;
    return profile.weightKg / (h * h);
  }

  getBmiCategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  getBmiColor(bmi: number): string {
    if (bmi < 18.5) return 'warning';
    if (bmi < 25) return 'success';
    if (bmi < 30) return 'warning';
    return 'danger';
  }

  getActivityLabel(level: string): string {
    const map: Record<string, string> = {
      sedentary: 'Sedentary',
      lightly_active: 'Lightly Active',
      moderately_active: 'Moderately Active',
      very_active: 'Very Active',
      extremely_active: 'Extremely Active',
    };
    return map[level] || level;
  }

  getGoalLabel(goal: string): string {
    const map: Record<string, string> = {
      lose_weight: 'Lose Weight',
      maintain: 'Maintain Weight',
      gain_muscle: 'Gain Muscle',
    };
    return map[goal] || goal;
  }

  async exportData(): Promise<void> {
    this.isExporting = true;
    this.cdr.markForCheck();
    try {
      await this.dataTransfer.exportData();
    } catch (e: any) {
      const alert = await this.alertCtrl.create({
        header: 'Export Failed',
        message: e?.message || 'Could not export data.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.isExporting = false;
      this.cdr.markForCheck();
    }
  }

  async importData(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be picked again
    input.value = '';

    this.isImporting = true;
    this.cdr.markForCheck();

    try {
      const result = await this.dataTransfer.importData(file);
      const alert = await this.alertCtrl.create({
        header: '✅ Import Complete',
        message:
          `Added ${result.exerciseLogs} new workout log(s).\n` +
          (result.hasProfile ? 'Profile data restored.\n' : '') +
          (result.hasWorkoutPlan ? 'Workout plan restored.' : ''),
        buttons: ['OK'],
      });
      await alert.present();
    } catch (e: any) {
      const alert = await this.alertCtrl.create({
        header: 'Import Failed',
        message: e?.message || 'Could not read the file.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.isImporting = false;
      this.cdr.markForCheck();
    }
  }
}

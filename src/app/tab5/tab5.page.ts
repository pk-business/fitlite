import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../models';
import { UserProfileService } from '../services/user-profile.service';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class Tab5Page implements OnInit {
  isLoading = true;
  userProfile: UserProfile | null = null;

  constructor(
    private userProfileService: UserProfileService,
    private router: Router,
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
}

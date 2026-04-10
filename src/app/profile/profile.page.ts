import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserProfile } from '../models';
import { UserProfileService } from '../services/user-profile.service';
import { PlanService } from '../services/plan.service';
import { ScheduleService } from '../services/schedule.service';
import { ThemeService } from '../services/theme.service';
import { LoadingController, ToastController, IonicModule } from '@ionic/angular';

/**
 * ProfilePage allows users to input/edit their profile information
 * and generates workout and diet plans based on their input
 */
@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    imports: [IonicModule, FormsModule, ReactiveFormsModule]
})
export class ProfilePage implements OnInit {
  profileForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private userProfileService: UserProfileService,
    private planService: PlanService,
    private scheduleService: ScheduleService,
    private themeService: ThemeService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.initializeForm();
    await this.loadExistingProfile();
  }

  /**
   * Initialize the profile form with validators
   */
  private initializeForm(): void {
    this.profileForm = this.fb.group({
      name: [''],
      age: [25, [Validators.required, Validators.min(13), Validators.max(100)]],
      heightCm: [170, [Validators.required, Validators.min(100), Validators.max(250)]],
      weightKg: [70, [Validators.required, Validators.min(30), Validators.max(300)]],
      gender: ['male', Validators.required],
      goal: ['maintain', Validators.required],
      activityLevel: ['medium', Validators.required]
    });
  }

  /**
   * Load existing profile if available
   */
  private async loadExistingProfile(): Promise<void> {
    const profile = await this.userProfileService.loadProfile();
    if (profile) {
      this.isEditMode = true;
      this.profileForm.patchValue(profile);
    }
  }

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      await this.showToast('Please fill in all required fields correctly', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.isEditMode ? 'Updating your profile...' : 'Generating your personalized plan...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const profile: UserProfile = this.profileForm.value;

      // Save profile
      await this.userProfileService.saveProfile(profile);

      // Generate workout and diet plans (regenerate on update as well)
      await this.planService.generateAllPlans(profile);

      // Initialize default notification schedule (only if not edit mode)
      if (!this.isEditMode) {
        await this.scheduleService.initializeDefaultSchedule();
      }

      await loading.dismiss();
      await this.showToast(
        this.isEditMode 
          ? 'Profile updated successfully! 🎉' 
          : 'Profile saved and plans generated successfully! 🎉', 
        'success'
      );

      // Navigate back or to home
      if (this.isEditMode) {
        this.goBack();
      } else {
        this.router.navigate(['/tabs/home']);
      }
    } catch (error) {
      await loading.dismiss();
      console.error('Error saving profile:', error);
      await this.showToast('Error saving profile. Please try again.', 'danger');
    }
  }

  /**
   * Navigate back
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  /**
   * Get BMI preview (read-only calculation)
   */
  get bmiPreview(): string {
    const heightCm = this.profileForm.get('heightCm')?.value;
    const weightKg = this.profileForm.get('weightKg')?.value;

    if (heightCm && weightKg) {
      const heightM = heightCm / 100;
      const bmi = weightKg / (heightM * heightM);
      return bmi.toFixed(1);
    }

    return '--';
  }
}

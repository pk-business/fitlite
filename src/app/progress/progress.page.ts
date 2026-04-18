import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ExerciseLogService } from '../services/exercise-log.service';
import { UserProfileService } from '../services/user-profile.service';

@Component({
  selector: 'app-progress',
  templateUrl: 'progress.page.html',
  styleUrls: ['progress.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ProgressPage implements OnInit {
  isLoading = true;
  hasProfile = false;
  selectedExercise: string | null = null;
  exerciseNames: string[] = [];

  // Simulated data for placeholder charts
  weeklyVolume = [
    { day: 'Mon', value: 4200 },
    { day: 'Tue', value: 3800 },
    { day: 'Wed', value: 0 },
    { day: 'Thu', value: 5100 },
    { day: 'Fri', value: 4700 },
    { day: 'Sat', value: 2900 },
    { day: 'Sun', value: 0 },
  ];

  bodyPartData = [
    { part: 'Chest', percentage: 35, color: '#4fc3f7' },
    { part: 'Back', percentage: 25, color: '#81c784' },
    { part: 'Legs', percentage: 20, color: '#ffb74d' },
    { part: 'Shoulders', percentage: 12, color: '#ce93d8' },
    { part: 'Arms', percentage: 8, color: '#f48fb1' },
  ];

  maxVolume = 5100;

  constructor(
    private userProfileService: UserProfileService,
    private exerciseLogService: ExerciseLogService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    this.cdr.markForCheck();
    try {
      const profile = await this.userProfileService.loadProfile();
      this.hasProfile = !!profile;
      if (this.hasProfile) {
        const logs = await this.exerciseLogService.loadLogs();
        const nameSet = new Set<string>();
        logs.forEach((log: any) => nameSet.add(log.exerciseName));
        this.exerciseNames = Array.from(nameSet).slice(0, 10);
        if (this.exerciseNames.length > 0) {
          this.selectedExercise = this.exerciseNames[0];
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getBarHeight(value: number): number {
    return Math.round((value / this.maxVolume) * 100);
  }

  getSegmentOffset(index: number): number {
    // circumference ≈ 2 * π * r = 2 * 3.14159 * 35 ≈ 219.9 → scaled to 100 via stroke-dasharray trick
    // offset = 100 - sum of previous percentages
    let offset = 25; // rotate start to top
    for (let i = 0; i < index; i++) {
      offset -= this.bodyPartData[i].percentage;
    }
    return offset;
  }
}

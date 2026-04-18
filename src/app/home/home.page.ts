import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '../services/user-profile.service';
import { PlanService } from '../services/plan.service';

interface FeedPost {
  id: number;
  username: string;
  initials: string;
  avatarColor: string;
  timeAgo: string;
  category: string;
  content: string;
  likes: number;
  comments: number;
  liked: boolean;
  stats?: { icon: string; value: string; label: string }[];
}

interface FriendSuggestion {
  username: string;
  initials: string;
  avatarColor: string;
  mutualFriends: number;
  goal: string;
}

/**
 * HomePage - Social media-style fitness feed
 */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage implements OnInit {
  isLoading = true;
  hasProfile = false;

  feedPosts: FeedPost[] = [
    {
      id: 1,
      username: 'Alex_Lifts',
      initials: 'AL',
      avatarColor: 'linear-gradient(135deg, #4fc3f7, #0288d1)',
      timeAgo: '2h ago',
      category: 'Workout',
      content:
        'Crushed a new PR on bench press today! 💪 225 lbs x 5 reps. Consistency is the key!',
      likes: 42,
      comments: 8,
      liked: false,
      stats: [
        { icon: 'barbell-outline', value: '225 lbs', label: 'Bench PR' },
        { icon: 'time-outline', value: '1h 15m', label: 'Duration' },
        { icon: 'flame-outline', value: '520', label: 'Calories' },
      ],
    },
    {
      id: 2,
      username: 'RunnerMike',
      initials: 'RM',
      avatarColor: 'linear-gradient(135deg, #81c784, #2e7d32)',
      timeAgo: '4h ago',
      category: 'Cardio',
      content:
        'Morning 5K run done! 🏃 Beautiful weather today. Nothing like starting the day with a run.',
      likes: 29,
      comments: 5,
      liked: true,
      stats: [
        { icon: 'walk-outline', value: '5.0 km', label: 'Distance' },
        { icon: 'time-outline', value: '24:32', label: 'Time' },
        { icon: 'speedometer-outline', value: '4:54', label: 'Pace/km' },
      ],
    },
    {
      id: 3,
      username: 'NutriQueen',
      initials: 'NQ',
      avatarColor: 'linear-gradient(135deg, #ffb74d, #ef6c00)',
      timeAgo: '6h ago',
      category: 'Nutrition',
      content:
        'Meal prepped for the whole week! 🥗 High protein, balanced macros. Sunday prep = stress-free week!',
      likes: 56,
      comments: 12,
      liked: false,
      stats: [
        { icon: 'nutrition-outline', value: '2,100', label: 'Calories' },
        { icon: 'body-outline', value: '180g', label: 'Protein' },
      ],
    },
  ];

  friendSuggestions: FriendSuggestion[] = [
    {
      username: 'FitSarah',
      initials: 'FS',
      avatarColor: 'linear-gradient(135deg, #ce93d8, #7b1fa2)',
      mutualFriends: 3,
      goal: 'Gain Muscle',
    },
    {
      username: 'IronJack',
      initials: 'IJ',
      avatarColor: 'linear-gradient(135deg, #f48fb1, #c2185b)',
      mutualFriends: 5,
      goal: 'Lose Weight',
    },
    {
      username: 'YogaLisa',
      initials: 'YL',
      avatarColor: 'linear-gradient(135deg, #80cbc4, #00695c)',
      mutualFriends: 2,
      goal: 'Stay Active',
    },
    {
      username: 'PowerDave',
      initials: 'PD',
      avatarColor: 'linear-gradient(135deg, #ffcc02, #f57f17)',
      mutualFriends: 7,
      goal: 'Gain Muscle',
    },
  ];

  constructor(
    private userProfileService: UserProfileService,
    private planService: PlanService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();
    try {
      const profile = await this.userProfileService.loadProfile();
      this.hasProfile = !!profile;
      if (profile) {
        const existingPlan = await this.planService.getWorkoutPlan();
        if (!existingPlan) {
          await this.planService.generateAllPlans(profile);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.hasProfile = false;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  async handleRefresh(event: any): Promise<void> {
    await this.loadData();
    event.target.complete();
  }

  toggleLike(post: FeedPost): void {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    this.cdr.markForCheck();
  }
}

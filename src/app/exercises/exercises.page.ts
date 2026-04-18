import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ExerciseLibraryService } from '../services/exercise-library.service';
import {
  LibraryExercise,
  ExerciseFilters,
} from '../models/exercise-library.model';

/**
 * ExercisesPage — full "Add Exercise" flow.
 *
 * Users can:
 *  1. Search the bundled exercise library instantly
 *  2. Filter by muscle group, equipment and difficulty (multi-select chips)
 *  3. Browse smart sections: Recently Used, Popular, All Exercises
 *  4. Tap any card to add it to today's workout
 *  5. Open an inline bottom-sheet to create a fully custom exercise
 */
@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.page.html',
  styleUrls: ['./exercises.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    NgTemplateOutlet,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ExercisesPage implements OnInit, OnDestroy {
  // ── Reactive data ─────────────────────────────────────────────────────────
  filteredExercises: LibraryExercise[] = [];
  recentlyUsed: LibraryExercise[] = [];
  popular: LibraryExercise[] = [];
  activeFilters: ExerciseFilters = {
    muscles: [],
    equipment: [],
    difficulty: [],
    searchQuery: '',
  };

  // ── UI state ──────────────────────────────────────────────────────────────
  showCustomModal = false;
  isSubmittingCustom = false;
  /** Tracks which exercises were added this session for the ✓ icon */
  addedExerciseIds = new Set<string>();
  /** Exercise currently shown in the preview bottom-sheet (null = closed) */
  previewExercise: LibraryExercise | null = null;

  // ── Filter chip groups ────────────────────────────────────────────────────
  muscleGroups: string[];
  equipmentTypes: string[];
  difficultyLevels: { value: string; label: string; color: string }[];

  // ── Custom exercise form ──────────────────────────────────────────────────
  customForm!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private libraryService: ExerciseLibraryService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.muscleGroups = libraryService.muscleGroups;
    this.equipmentTypes = libraryService.equipmentTypes;
    this.difficultyLevels = libraryService.difficultyLevels;
  }

  ngOnInit(): void {
    this.buildCustomForm();

    this.libraryService.filteredExercises$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ex) => (this.filteredExercises = ex));

    this.libraryService.recentlyUsed$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ex) => (this.recentlyUsed = ex));

    this.libraryService.popular$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ex) => (this.popular = ex));

    this.libraryService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe((f) => (this.activeFilters = f));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Reset filters so returning to the page feels fresh
    this.libraryService.clearFilters();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  goBack(): void {
    this.navCtrl.back();
  }

  // ── Search ────────────────────────────────────────────────────────────────

  onSearchChange(event: CustomEvent): void {
    this.libraryService.setSearchQuery((event.detail.value as string) ?? '');
  }

  // ── Chip filters ──────────────────────────────────────────────────────────

  toggleMuscle(muscle: string): void {
    this.libraryService.toggleMuscle(muscle);
  }
  toggleEquipment(eq: string): void {
    this.libraryService.toggleEquipment(eq);
  }
  toggleDifficulty(diff: string): void {
    this.libraryService.toggleDifficulty(diff);
  }

  isMuscleActive(muscle: string): boolean {
    return this.activeFilters.muscles.includes(muscle as any);
  }
  isEquipmentActive(eq: string): boolean {
    return this.activeFilters.equipment.includes(eq as any);
  }
  isDifficultyActive(diff: string): boolean {
    return this.activeFilters.difficulty.includes(diff as any);
  }

  get hasActiveFilters(): boolean {
    return (
      this.activeFilters.muscles.length > 0 ||
      this.activeFilters.equipment.length > 0 ||
      this.activeFilters.difficulty.length > 0
    );
  }

  clearFilters(): void {
    this.libraryService.clearFilters();
  }

  // ── Add to workout ────────────────────────────────────────────────────────

  async addExercise(exercise: LibraryExercise): Promise<void> {
    await this.libraryService.markAsUsed(exercise.id);
    this.addedExerciseIds.add(exercise.id);
    await this.showToast(
      `✅ ${exercise.name} added to today's workout`,
      'success',
    );
  }

  isAdded(id: string): boolean {
    return this.addedExerciseIds.has(id);
  }

  // ── Exercise preview ─────────────────────────────────────────────────────

  openPreview(ex: LibraryExercise, event: Event): void {
    event.stopPropagation();
    this.previewExercise = ex;
  }

  closePreview(): void {
    this.previewExercise = null;
  }

  async confirmAdd(ex: LibraryExercise): Promise<void> {
    await this.addExercise(ex);
    this.closePreview();
  }

  // ── Custom exercise modal ─────────────────────────────────────────────────

  openCustomModal(): void {
    this.buildCustomForm();
    this.showCustomModal = true;
  }

  closeCustomModal(): void {
    this.showCustomModal = false;
    this.customForm.reset({ sets: 3, reps: 12, weight: 0 });
  }

  async saveCustomExercise(): Promise<void> {
    if (this.customForm.invalid) {
      this.customForm.markAllAsTouched();
      return;
    }
    this.isSubmittingCustom = true;
    try {
      const { name, sets, reps, weight } = this.customForm.value;
      const newEx = await this.libraryService.addCustomExercise({
        name,
        primaryMuscle: 'Custom',
        secondaryMuscles: [],
        equipment: ['Other'],
        difficulty: 'beginner',
        mediaUrl: '',
        thumbnailUrl: '',
        tags: ['custom'],
      });
      await this.addExercise(newEx);
      this.closeCustomModal();
    } finally {
      this.isSubmittingCustom = false;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  difficultyColor(diff: string): string {
    return (
      (
        {
          beginner: 'success',
          intermediate: 'warning',
          advanced: 'danger',
        } as any
      )[diff] ?? 'medium'
    );
  }

  trackById(_: number, ex: LibraryExercise): string {
    return ex.id;
  }

  private buildCustomForm(): void {
    this.customForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(60),
        ],
      ],
      sets: [3, [Validators.required, Validators.min(1), Validators.max(20)]],
      reps: [12, [Validators.required, Validators.min(1), Validators.max(200)]],
      weight: [
        0,
        [Validators.required, Validators.min(0), Validators.max(1000)],
      ],
    });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      position: 'bottom',
      color,
      cssClass: 'exercise-added-toast',
    });
    await toast.present();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ExerciseLibraryService } from '../../services/exercise-library.service';
import {
  LibraryExercise,
  ExerciseFilters,
} from '../../models/exercise-library.model';
import { isCardioExercise } from '../../models/exercise-log.model';

/**
 * ExerciseSelectorModal — full "Add Exercise" flow.
 *
 * Users can:
 *  1. Instantly search the bundled 20-exercise library
 *  2. Filter by muscle group, equipment, and difficulty (multi-select chips)
 *  3. Browse Recently Used, Popular, and All Exercises sections
 *  4. Tap any row to add it to the current workout day
 *  5. Create a fully custom exercise via an inline bottom sheet
 */
@Component({
  selector: 'app-exercise-selector-modal',
  templateUrl: './exercise-selector-modal.component.html',
  styleUrls: ['./exercise-selector-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    NgTemplateOutlet,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ExerciseSelectorModal implements OnInit, OnDestroy {
  // ── Reactive data ───────────────────────────────────────────────────────
  filteredExercises: LibraryExercise[] = [];
  recentlyUsed: LibraryExercise[] = [];
  popular: LibraryExercise[] = [];
  activeFilters: ExerciseFilters = {
    muscles: [],
    equipment: [],
    difficulty: [],
    searchQuery: '',
  };

  // ── UI state ────────────────────────────────────────────────────────────
  showCustomSheet = false;
  isSubmittingCustom = false;
  /** Exercise currently shown in the preview bottom-sheet (null = closed) */
  previewExercise: LibraryExercise | null = null;

  // ── Filter chip groups ──────────────────────────────────────────────────
  muscleGroups: string[];
  equipmentTypes: string[];
  difficultyLevels: { value: string; label: string; color: string }[];

  // ── Custom form ─────────────────────────────────────────────────────────
  customForm!: FormGroup;
  /** True when the custom exercise name matches cardio keywords */
  isCustomFormCardio = false;
  forceStrength = false;

  private destroy$ = new Subject<void>();

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private libraryService: ExerciseLibraryService,
    private fb: FormBuilder,
  ) {
    this.muscleGroups = libraryService.muscleGroups;
    this.equipmentTypes = libraryService.equipmentTypes;
    this.difficultyLevels = libraryService.difficultyLevels;
  }

  ngOnInit(): void {
    this.buildCustomForm();
    this.subscribeNameToCardioDetection();

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
    this.libraryService.clearFilters();
  }

  // ── Search ──────────────────────────────────────────────────────────────

  onSearchChange(event: CustomEvent): void {
    this.libraryService.setSearchQuery((event.detail.value as string) ?? '');
  }

  // ── Chip filters ────────────────────────────────────────────────────────

  toggleMuscle(m: string): void {
    this.libraryService.toggleMuscle(m);
  }
  toggleEquipment(eq: string): void {
    this.libraryService.toggleEquipment(eq);
  }
  toggleDifficulty(d: string): void {
    this.libraryService.toggleDifficulty(d);
  }

  isMuscleActive(m: string): boolean {
    return this.activeFilters.muscles.includes(m as any);
  }
  isEquipmentActive(eq: string): boolean {
    return this.activeFilters.equipment.includes(eq as any);
  }
  isDifficultyActive(d: string): boolean {
    return this.activeFilters.difficulty.includes(d as any);
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
  // ── Exercise preview ─────────────────────────────────────────────────

  openPreview(ex: LibraryExercise, event: Event): void {
    event.stopPropagation();
    this.previewExercise = ex;
  }

  closePreview(): void {
    this.previewExercise = null;
  }

  async confirmSelect(ex: LibraryExercise): Promise<void> {
    this.closePreview();
    await this.selectExercise(ex);
  }

  // ── Select exercise → dismiss with result ───────────────────────────

  async selectExercise(exercise: LibraryExercise): Promise<void> {
    await this.libraryService.markAsUsed(exercise.id);
    this.modalCtrl.dismiss({ exercise });
  }

  // ── Custom exercise sheet ───────────────────────────────────────────────

  openCustomSheet(): void {
    this.buildCustomForm();
    this.subscribeNameToCardioDetection();
    this.showCustomSheet = true;
  }

  closeCustomSheet(): void {
    this.showCustomSheet = false;
    this.isCustomFormCardio = false;
    this.forceStrength = false;
    this.customForm.reset({ sets: 3, reps: 12, weight: 0, durationMinutes: 20, distanceKm: null, intensity: 'moderate' });
  }

  private subscribeNameToCardioDetection(): void {
    this.customForm.get('name')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((name: string) => {
        this.isCustomFormCardio = isCardioExercise(name || '') && !this.forceStrength;
      });
  }

  async saveCustomExercise(): Promise<void> {
    if (this.customForm.invalid) {
      this.customForm.markAllAsTouched();
      return;
    }
    this.isSubmittingCustom = true;
    try {
      const { name } = this.customForm.value;
      const isCardio = this.isCustomFormCardio;
      const newEx = await this.libraryService.addCustomExercise({
        name,
        primaryMuscle: isCardio ? 'Custom' : 'Custom',
        secondaryMuscles: [],
        equipment: ['Other'],
        difficulty: 'beginner',
        mediaUrl: '',
        thumbnailUrl: '',
        tags: isCardio ? ['custom', 'cardio'] : ['custom'],
        // Store cardio category so the log modal detects it
        ...(isCardio ? { category: 'cardio' } as any : {}),
      });
      await this.selectExercise(newEx);
    } finally {
      this.isSubmittingCustom = false;
    }
  }

  // ── Modal ───────────────────────────────────────────────────────────────

  close(): void {
    this.modalCtrl.dismiss();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

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
      // Strength fields
      sets: [3, [Validators.required, Validators.min(1), Validators.max(20)]],
      reps: [12, [Validators.required, Validators.min(1), Validators.max(200)]],
      weight: [0, [Validators.required, Validators.min(0), Validators.max(1000)]],
      // Cardio fields
      durationMinutes: [20, [Validators.min(1), Validators.max(600)]],
      distanceKm: [null, [Validators.min(0), Validators.max(1000)]],
      intensity: ['moderate'],
    });
  }
}

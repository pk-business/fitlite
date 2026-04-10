import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomExercise } from '../models';
import { ExerciseService } from '../services/exercise.service';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

/**
 * ExercisesPage allows users to manage their custom exercise library
 * Create, view, edit, and delete custom exercises
 */
@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.page.html',
  styleUrls: ['./exercises.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class ExercisesPage implements OnInit {
  exercises: CustomExercise[] = [];
  isLoading = true;
  showAddForm = false;
  exerciseForm!: FormGroup;
  editingExerciseId: string | null = null;

  categories = [
    { value: 'upper', label: 'Upper Body' },
    { value: 'lower', label: 'Lower Body' },
    { value: 'full', label: 'Full Body' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'custom', label: 'Custom' }
  ];

  constructor(
    private exerciseService: ExerciseService,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.initializeForm();
    await this.loadExercises();
  }

  /**
   * Initialize the exercise form
   */
  private initializeForm(): void {
    this.exerciseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['upper', Validators.required],
      sets: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      reps: [12, [Validators.required, Validators.min(1), Validators.max(100)]],
      restSeconds: [60, [Validators.required, Validators.min(10), Validators.max(300)]]
    });
  }

  /**
   * Load all custom exercises
   */
  async loadExercises(): Promise<void> {
    this.isLoading = true;
    try {
      this.exercises = await this.exerciseService.loadExercises();
    } catch (error) {
      console.error('Error loading exercises:', error);
      await this.showToast('Error loading exercises', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Toggle the add form visibility
   */
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.cancelEdit();
    }
  }

  /**
   * Save a new or edited exercise
   */
  async saveExercise(): Promise<void> {
    if (this.exerciseForm.invalid) {
      await this.showToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const formValue = this.exerciseForm.value;

      if (this.editingExerciseId) {
        // Update existing exercise
        await this.exerciseService.updateExercise(this.editingExerciseId, formValue);
        await this.showToast('Exercise updated successfully', 'success');
      } else {
        // Add new exercise
        await this.exerciseService.addExercise(formValue);
        await this.showToast('Exercise added successfully', 'success');
      }

      await this.loadExercises();
      this.cancelEdit();
      this.showAddForm = false;
    } catch (error) {
      console.error('Error saving exercise:', error);
      await this.showToast('Error saving exercise', 'danger');
    }
  }

  /**
   * Edit an existing exercise
   */
  editExercise(exercise: CustomExercise): void {
    this.editingExerciseId = exercise.id;
    this.exerciseForm.patchValue({
      name: exercise.name,
      category: exercise.category,
      sets: exercise.sets,
      reps: exercise.reps,
      restSeconds: exercise.restSeconds
    });
    this.showAddForm = true;
  }

  /**
   * Cancel editing
   */
  cancelEdit(): void {
    this.editingExerciseId = null;
    this.exerciseForm.reset({
      name: '',
      category: 'upper',
      sets: 3,
      reps: 12,
      restSeconds: 60
    });
  }

  /**
   * Delete an exercise with confirmation
   */
  async deleteExercise(exercise: CustomExercise): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete Exercise',
      message: `Are you sure you want to delete "${exercise.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.exerciseService.deleteExercise(exercise.id);
              await this.loadExercises();
              await this.showToast('Exercise deleted', 'success');
            } catch (error) {
              console.error('Error deleting exercise:', error);
              await this.showToast('Error deleting exercise', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Get exercises grouped by category
   */
  getExercisesByCategory(category: string): CustomExercise[] {
    return this.exercises.filter(ex => ex.category === category);
  }

  /**
   * Get category label
   */
  getCategoryLabel(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : category;
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  /**
   * Navigate back
   */
  goBack(): void {
    this.router.navigate(['/tabs/schedule']);
  }
}

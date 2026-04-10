import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Exercise, CustomExercise } from '../../models';
import { ExerciseService } from '../../services/exercise.service';

/**
 * ExerciseSelectorModal allows users to select an exercise from:
 * 1. Their custom exercises
 * 2. Default exercise templates
 * 3. Create a new custom exercise on the fly
 */
@Component({
  selector: 'app-exercise-selector-modal',
  templateUrl: './exercise-selector-modal.component.html',
  styleUrls: ['./exercise-selector-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ExerciseSelectorModal implements OnInit {
  @Input() category: 'full' | 'upper' | 'lower' | 'cardio' | 'custom' = 'full';

  customExercises: CustomExercise[] = [];
  defaultExercises: Exercise[] = [];
  filteredCustomExercises: CustomExercise[] = [];
  filteredDefaultExercises: Exercise[] = [];

  searchTerm = '';
  selectedTab: 'custom' | 'default' = 'custom';

  constructor(
    private modalCtrl: ModalController,
    private exerciseService: ExerciseService
  ) {}

  async ngOnInit() {
    await this.loadExercises();
  }

  /**
   * Load exercises from service
   */
  async loadExercises(): Promise<void> {
    // Load custom exercises
    this.customExercises = await this.exerciseService.loadExercises();
    
    // Get default templates
    this.defaultExercises = this.exerciseService.getDefaultExerciseTemplates();

    // Filter by category
    this.filterExercises();
  }

  /**
   * Filter exercises by category and search term
   */
  filterExercises(): void {
    let customFiltered = this.customExercises;
    let defaultFiltered = this.defaultExercises;

    // Filter by category
    if (this.category && this.category !== 'custom') {
      customFiltered = customFiltered.filter(ex => ex.category === this.category);
      defaultFiltered = defaultFiltered.filter(ex => ex.category === this.category);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      customFiltered = customFiltered.filter(ex => 
        ex.name.toLowerCase().includes(term)
      );
      defaultFiltered = defaultFiltered.filter(ex => 
        ex.name.toLowerCase().includes(term)
      );
    }

    this.filteredCustomExercises = customFiltered;
    this.filteredDefaultExercises = defaultFiltered;
  }

  /**
   * Handle search input
   */
  onSearchChange(): void {
    this.filterExercises();
  }

  /**
   * Select an exercise
   */
  selectExercise(exercise: Exercise | CustomExercise): void {
    // Convert CustomExercise to Exercise if needed
    const selectedEx: Exercise = 'isCustom' in exercise 
      ? this.exerciseService.toExercise(exercise)
      : exercise;

    this.modalCtrl.dismiss({
      exercise: selectedEx
    });
  }

  /**
   * Create new exercise on the fly
   */
  async createQuickExercise(): Promise<void> {
    this.modalCtrl.dismiss({
      createNew: true
    });
  }

  /**
   * Close modal
   */
  close(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Change tab
   */
  changeTab(tab: 'custom' | 'default'): void {
    this.selectedTab = tab;
  }
}

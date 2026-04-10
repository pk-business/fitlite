import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExerciseSelectorModal } from './exercise-selector-modal.component';

describe('ExerciseSelectorModal', () => {
  let component: ExerciseSelectorModal;
  let fixture: ComponentFixture<ExerciseSelectorModal>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseSelectorModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExerciseLogModal } from './exercise-log-modal.component';

describe('ExerciseLogModal', () => {
  let component: ExerciseLogModal;
  let fixture: ComponentFixture<ExerciseLogModal>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseLogModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

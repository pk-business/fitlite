import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutBuilderPage } from './workout-builder.page';

describe('WorkoutBuilderPage', () => {
  let component: WorkoutBuilderPage;
  let fixture: ComponentFixture<WorkoutBuilderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutBuilderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

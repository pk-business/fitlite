import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { WorkoutDayComponent } from './workout-day.component';

describe('WorkoutDayComponent', () => {
  let component: WorkoutDayComponent;
  let fixture: ComponentFixture<WorkoutDayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), WorkoutDayComponent]
}).compileComponents();

    fixture = TestBed.createComponent(WorkoutDayComponent);
    component = fixture.componentInstance;
    component.workoutDay = {
      dayOfWeek: 1,
      focus: 'full',
      exercises: []
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnhancedWorkoutCardComponent } from './enhanced-workout-card.component';
import { ExerciseLogService } from '../../services/exercise-log.service';
import { RestTimerService } from '../../services/rest-timer.service';
import { ProgressService } from '../../services/progress.service';
import { Exercise } from '../../models';

describe('EnhancedWorkoutCardComponent', () => {
  let component: EnhancedWorkoutCardComponent;
  let fixture: ComponentFixture<EnhancedWorkoutCardComponent>;
  let exerciseLogService: jasmine.SpyObj<ExerciseLogService>;
  let restTimerService: jasmine.SpyObj<RestTimerService>;
  let progressService: jasmine.SpyObj<ProgressService>;

  const mockExercise: Exercise = {
    name: 'Bench Press',
    sets: 3,
    reps: 10,
    restSeconds: 90,
    category: 'upper'
  };

  beforeEach(async () => {
    const exerciseLogServiceSpy = jasmine.createSpyObj('ExerciseLogService', [
      'getLastLogForExercise',
      'addLog'
    ]);
    const restTimerServiceSpy = jasmine.createSpyObj('RestTimerService', ['startTimer']);
    const progressServiceSpy = jasmine.createSpyObj('ProgressService', ['getExerciseProgress']);

    await TestBed.configureTestingModule({
      imports: [EnhancedWorkoutCardComponent],
      providers: [
        { provide: ExerciseLogService, useValue: exerciseLogServiceSpy },
        { provide: RestTimerService, useValue: restTimerServiceSpy },
        { provide: ProgressService, useValue: progressServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnhancedWorkoutCardComponent);
    component = fixture.componentInstance;
    component.exercise = mockExercise;
    
    exerciseLogService = TestBed.inject(ExerciseLogService) as jasmine.SpyObj<ExerciseLogService>;
    restTimerService = TestBed.inject(RestTimerService) as jasmine.SpyObj<RestTimerService>;
    progressService = TestBed.inject(ProgressService) as jasmine.SpyObj<ProgressService>;

    exerciseLogService.getLastLogForExercise.and.returnValue(null);
    progressServiceSpy.getExerciseProgress.and.returnValue({
      exerciseName: 'Bench Press',
      dataPoints: [],
      trend: 'insufficient-data',
      percentChange: 0,
      insight: 'No data yet',
      personalRecord: null
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle expanded state', () => {
    expect(component.isExpanded).toBe(false);
    component.toggleExpanded();
    expect(component.isExpanded).toBe(true);
  });

  it('should start new set with correct values', () => {
    component.startNewSet(100, 10);
    expect(component.sessionData.currentSet).toBeTruthy();
    expect(component.sessionData.currentSet?.weight).toBe(100);
    expect(component.sessionData.currentSet?.reps).toBe(10);
  });

  it('should handle set completion', () => {
    const set = {
      setNumber: 1,
      weight: 100,
      reps: 10,
      isComplete: true,
      restTimerActive: false
    };

    component.onSetCompleted(set);
    
    expect(component.sessionData.completedSets.length).toBe(1);
    expect(restTimerService.startTimer).toHaveBeenCalled();
  });

  it('should calculate completion percentage correctly', () => {
    component.sessionData.completedSets = [
      { setNumber: 1, weight: 100, reps: 10, isComplete: true, restTimerActive: false }
    ];
    
    const percentage = component.getCompletionPercentage();
    expect(percentage).toBe(100 / 3); // 1 out of 3 sets
  });
});

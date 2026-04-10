import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestTimerComponent } from './rest-timer.component';
import { RestTimerService } from '../../services/rest-timer.service';
import { of } from 'rxjs';

describe('RestTimerComponent', () => {
  let component: RestTimerComponent;
  let fixture: ComponentFixture<RestTimerComponent>;
  let restTimerService: jasmine.SpyObj<RestTimerService>;

  beforeEach(async () => {
    const restTimerServiceSpy = jasmine.createSpyObj('RestTimerService', [
      'getProgress',
      'formatTime',
      'pauseTimer',
      'resumeTimer',
      'stopTimer',
      'adjustTimer'
    ]);
    restTimerServiceSpy.timer$ = of(null);

    await TestBed.configureTestingModule({
      imports: [RestTimerComponent],
      providers: [
        { provide: RestTimerService, useValue: restTimerServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RestTimerComponent);
    component = fixture.componentInstance;
    restTimerService = TestBed.inject(RestTimerService) as jasmine.SpyObj<RestTimerService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle expanded state', () => {
    expect(component.isExpanded).toBe(false);
    component.toggleExpanded();
    expect(component.isExpanded).toBe(true);
    component.toggleExpanded();
    expect(component.isExpanded).toBe(false);
  });

  it('should call pauseTimer when not paused', () => {
    component.timerState = {
      exerciseName: 'Test',
      setNumber: 1,
      durationSeconds: 60,
      remainingSeconds: 30,
      isActive: true,
      isPaused: false
    };

    component.togglePause();
    expect(restTimerService.pauseTimer).toHaveBeenCalled();
  });

  it('should call resumeTimer when paused', () => {
    component.timerState = {
      exerciseName: 'Test',
      setNumber: 1,
      durationSeconds: 60,
      remainingSeconds: 30,
      isActive: true,
      isPaused: true
    };

    component.togglePause();
    expect(restTimerService.resumeTimer).toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressGraphComponent } from './progress-graph.component';
import { ExerciseProgress } from '../../models';

describe('ProgressGraphComponent', () => {
  let component: ProgressGraphComponent;
  let fixture: ComponentFixture<ProgressGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressGraphComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show no data state when progress is undefined', () => {
    component.progress = undefined;
    component.ngOnChanges({});
    expect(component.hasData).toBe(false);
  });

  it('should generate SVG path when progress data is available', () => {
    const mockProgress: ExerciseProgress = {
      exerciseName: 'Bench Press',
      dataPoints: [
        { date: '2026-01-01', timestamp: 1, maxWeight: 100, maxReps: 10, totalVolume: 1000, averageWeight: 100, averageReps: 10 },
        { date: '2026-01-02', timestamp: 2, maxWeight: 105, maxReps: 10, totalVolume: 1050, averageWeight: 105, averageReps: 10 }
      ],
      trend: 'improving',
      percentChange: 5,
      insight: 'Up 5% this week',
      personalRecord: null
    };

    component.progress = mockProgress;
    component.ngOnChanges({ progress: {} as any });
    
    expect(component.hasData).toBe(true);
    expect(component.svgPath).toBeTruthy();
  });

  it('should emit graphClicked when clicked in mini mode', () => {
    spyOn(component.graphClicked, 'emit');
    component.mode = 'mini';
    
    component.onGraphClick();
    
    expect(component.graphClicked.emit).toHaveBeenCalled();
  });
});

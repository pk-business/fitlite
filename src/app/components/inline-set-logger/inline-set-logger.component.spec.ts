import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InlineSetLoggerComponent } from './inline-set-logger.component';
import { ActiveSet } from '../../models';

describe('InlineSetLoggerComponent', () => {
  let component: InlineSetLoggerComponent;
  let fixture: ComponentFixture<InlineSetLoggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlineSetLoggerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InlineSetLoggerComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    component.set = {
      setNumber: 1,
      weight: 0,
      reps: 0,
      isComplete: false,
      restTimerActive: false
    };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit setCompleted when completeSet is called with valid data', () => {
    spyOn(component.setCompleted, 'emit');
    component.set.weight = 100;
    component.set.reps = 10;
    
    component.completeSet();
    
    expect(component.setCompleted.emit).toHaveBeenCalledWith(component.set);
    expect(component.set.isComplete).toBe(true);
  });

  it('should not complete set when weight or reps is 0', () => {
    spyOn(component.setCompleted, 'emit');
    component.set.weight = 0;
    component.set.reps = 10;
    
    component.completeSet();
    
    expect(component.setCompleted.emit).not.toHaveBeenCalled();
    expect(component.set.isComplete).toBe(false);
  });

  it('should emit setDeleted when deleteSet is called', () => {
    spyOn(component.setDeleted, 'emit');
    
    component.deleteSet();
    
    expect(component.setDeleted.emit).toHaveBeenCalledWith(component.set.setNumber);
  });

  it('should emit setUpdated when weight changes', () => {
    spyOn(component.setUpdated, 'emit');
    
    component.onWeightChange();
    
    expect(component.setUpdated.emit).toHaveBeenCalledWith(component.set);
  });

  it('should emit setUpdated when reps change', () => {
    spyOn(component.setUpdated, 'emit');
    
    component.onRepsChange();
    
    expect(component.setUpdated.emit).toHaveBeenCalledWith(component.set);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WorkoutPage } from './workout.page';

describe('WorkoutPage', () => {
  let component: WorkoutPage;
  let fixture: ComponentFixture<WorkoutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), WorkoutPage]
}).compileComponents();

    fixture = TestBed.createComponent(WorkoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

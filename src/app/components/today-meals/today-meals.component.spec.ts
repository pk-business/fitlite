import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TodayMealsComponent } from './today-meals.component';

describe('TodayMealsComponent', () => {
  let component: TodayMealsComponent;
  let fixture: ComponentFixture<TodayMealsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TodayMealsComponent]
}).compileComponents();

    fixture = TestBed.createComponent(TodayMealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

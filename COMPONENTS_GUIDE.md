# FitLite UI Components Guide

## 📦 Reusable Components Overview

The app now includes reusable, modular UI components with **OnPush change detection** for optimal performance. All components are lightweight and follow Angular best practices.

## 🎨 Components

### 1. WorkoutDayComponent

**Purpose**: Display a single workout day with exercises

**Location**: `src/app/components/workout-day/`

**Inputs**:
- `workoutDay: WorkoutDay` (required) - The workout data
- `dayName?: string` (optional) - Custom day name override
- `showDayName: boolean` (optional, default: true) - Show/hide day name
- `isToday: boolean` (optional, default: false) - Highlight as today

**Usage**:
```html
<app-workout-day 
  [workoutDay]="workout" 
  [dayName]="'Monday'"
  [isToday]="true">
</app-workout-day>
```

**Features**:
- Color-coded badges by workout focus (full/upper/lower/cardio)
- Icon for each workout type
- Exercise list with sets, reps, and rest time
- "Today" chip indicator
- Numbered exercise list

---

### 2. MealCardComponent

**Purpose**: Display a single meal with nutritional information

**Location**: `src/app/components/meal-card/`

**Inputs**:
- `meal: Meal` (required) - The meal data
- `showIcon: boolean` (optional, default: true) - Show meal icon
- `compact: boolean` (optional, default: false) - Compact layout mode

**Usage**:
```html
<app-meal-card 
  [meal]="meal"
  [showIcon]="true"
  [compact]="false">
</app-meal-card>
```

**Features**:
- Color-coded icons by meal type (breakfast/lunch/dinner/snacks)
- Prominent calorie display
- Macros breakdown (protein, carbs, fat)
- Two layout modes: full and compact

---

### 3. TodayWorkoutComponent

**Purpose**: Smart component that fetches and displays today's workout

**Location**: `src/app/components/today-workout/`

**Inputs**: None (fetches data internally)

**Usage**:
```html
<app-today-workout></app-today-workout>
```

**Features**:
- Automatically loads today's workout from PlanService
- Shows loading spinner while fetching
- Displays WorkoutDayComponent when workout exists
- Shows "Rest Day" card when no workout scheduled
- OnPush change detection for performance

---

### 4. TodayMealsComponent

**Purpose**: Smart component that fetches and displays today's meals

**Location**: `src/app/components/today-meals/`

**Inputs**: None (fetches data internally)

**Usage**:
```html
<app-today-meals></app-today-meals>
```

**Features**:
- Automatically loads today's meals from PlanService
- Shows loading spinner while fetching
- Displays summary card with total calories and macros
- Shows list of MealCardComponents
- OnPush change detection for performance

---

## 📁 Module Structure

### SharedComponentsModule

All components are exported from `SharedComponentsModule` for easy reuse across pages.

**Location**: `src/app/components/shared-components.module.ts`

**Import in page modules**:
```typescript
import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedComponentsModule // Add this
  ],
  declarations: [YourPage]
})
export class YourPageModule {}
```

---

## 🎯 Component Types

### Presentational Components (Dumb)
- `WorkoutDayComponent`
- `MealCardComponent`

These components:
- Receive data via `@Input()`
- Don't fetch data themselves
- Pure display logic
- Reusable across multiple pages

### Smart Components (Container)
- `TodayWorkoutComponent`
- `TodayMealsComponent`

These components:
- Fetch data from services
- Manage their own state
- Use ChangeDetectorRef for OnPush
- Delegate display to presentational components

---

## 🚀 How to Use in Pages

### Example 1: Simple Display

```html
<!-- In your template -->
<app-workout-day [workoutDay]="workout"></app-workout-day>
```

```typescript
// In your component
import { WorkoutDay } from '../models';

workout: WorkoutDay = {
  dayOfWeek: 1,
  focus: 'upper',
  exercises: [...]
};
```

### Example 2: Display Today's Data

```html
<!-- Super simple - component handles everything -->
<app-today-workout></app-today-workout>
<app-today-meals></app-today-meals>
```

### Example 3: Weekly Plan with Loop

```html
<!-- Tab2 (Workouts Page) -->
<app-workout-day 
  *ngFor="let day of workoutPlan.weeklyPlan"
  [workoutDay]="day"
  [isToday]="isToday(day.dayOfWeek)">
</app-workout-day>
```

### Example 4: Meal List

```html
<!-- Tab3 (Diet Page) -->
<app-meal-card 
  *ngFor="let meal of dietDay.meals"
  [meal]="meal"
  [compact]="false">
</app-meal-card>
```

---

## 🎨 Styling

Each component has its own isolated SCSS file:
- `workout-day.component.scss`
- `meal-card.component.scss`
- `today-workout.component.scss`
- `today-meals.component.scss`

All styles use Ionic CSS variables for consistency:
```scss
--ion-color-primary
--ion-color-secondary
--ion-color-dark
--ion-color-medium
--ion-color-light
```

---

## ⚡ Performance Features

### OnPush Change Detection
All components use `ChangeDetectionStrategy.OnPush`:

```typescript
@Component({
  selector: 'app-workout-day',
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

Benefits:
- Faster rendering
- Lower battery consumption
- Better mobile performance
- Only updates when inputs change

### Manual Change Detection
Smart components use `ChangeDetectorRef`:

```typescript
constructor(private cdr: ChangeDetectorRef) {}

async loadData() {
  this.data = await this.service.getData();
  this.cdr.markForCheck(); // Trigger update
}
```

---

## 📝 Component Checklist

When creating new components:

- [ ] Use OnPush change detection
- [ ] Add all inputs with proper types
- [ ] Include JSDoc comments
- [ ] Create spec file for tests
- [ ] Keep template simple and clean
- [ ] Use Ionic components
- [ ] Minimal SCSS (prefer Ionic styles)
- [ ] Export from SharedComponentsModule

---

## 🧪 Testing

Each component includes a spec file:

```typescript
describe('WorkoutDayComponent', () => {
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

Run tests:
```bash
npm test
```

---

## 🔧 Customization

### Change Workout Focus Colors

Edit `workout-day.component.ts`:
```typescript
get focusColor(): string {
  const colors = {
    full: 'primary',      // Change these
    upper: 'secondary',
    lower: 'tertiary',
    cardio: 'danger'
  };
  return colors[this.workoutDay.focus];
}
```

### Change Meal Icons

Edit `meal-card.component.ts`:
```typescript
get mealIcon(): string {
  if (name.includes('breakfast')) return 'cafe-outline';
  // Add your custom logic
}
```

### Toggle Compact Mode

```html
<!-- Full mode -->
<app-meal-card [meal]="meal" [compact]="false"></app-meal-card>

<!-- Compact mode (inline macros) -->
<app-meal-card [meal]="meal" [compact]="true"></app-meal-card>
```

---

## 📚 Component Dependencies

```
SharedComponentsModule
├── WorkoutDayComponent
│   ├── Uses: WorkoutDay model
│   └── Displays: Exercise list
│
├── MealCardComponent
│   ├── Uses: Meal model
│   └── Displays: Calories + macros
│
├── TodayWorkoutComponent
│   ├── Uses: PlanService
│   ├── Contains: WorkoutDayComponent
│   └── Manages: Loading state
│
└── TodayMealsComponent
    ├── Uses: PlanService
    ├── Contains: MealCardComponent
    └── Manages: Loading state + calculations
```

---

## 🎯 Best Practices

1. **Keep Components Small**: Each component has a single responsibility
2. **Use @Input for Data**: Pass data down, emit events up
3. **OnPush Everywhere**: Better performance on mobile
4. **Smart vs Dumb**: Smart components fetch data, dumb components display it
5. **Ionic Components**: Always use Ionic for UI (ion-card, ion-list, etc.)
6. **Minimal SCSS**: Prefer Ionic's built-in styling
7. **TypeScript Strict**: Strong typing for all inputs
8. **Comments**: JSDoc for all public methods

---

## 📖 Examples in the App

### Tab1Page (Home)
Uses smart components:
```html
<app-today-workout></app-today-workout>
<app-today-meals></app-today-meals>
```

### Tab2Page (Workouts) - Potential Refactor
Could use presentational component:
```html
<app-workout-day 
  *ngFor="let day of workoutPlan.weeklyPlan"
  [workoutDay]="day">
</app-workout-day>
```

### Tab3Page (Diet) - Potential Refactor
Could use presentational component:
```html
<app-meal-card 
  *ngFor="let meal of dietDay.meals"
  [meal]="meal">
</app-meal-card>
```

---

## 🚀 Next Steps

Want to add more components? Follow this pattern:

1. **Create component**: `ng generate component components/my-component`
2. **Add OnPush**: Set change detection strategy
3. **Define @Inputs**: Add typed inputs
4. **Create template**: Use Ionic components
5. **Add styles**: Minimal SCSS
6. **Export**: Add to SharedComponentsModule
7. **Use**: Import SharedComponentsModule in page

---

## 💡 Tips

- **Reuse components** instead of duplicating code
- **Keep templates simple** - complex logic goes in TS
- **Use CSS variables** from Ionic theme
- **Test on device** for true performance
- **Profile with Chrome DevTools** to check change detection

---

**Built with Angular + Ionic + OnPush = ⚡ Lightning Fast UI** 🚀

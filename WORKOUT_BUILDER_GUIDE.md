# Editable Workout Plan - User Guide

## Overview

The FitLite app now features a **full workout plan editor**! You can add exercises, edit workouts, reorder exercises, and completely customize your weekly workout schedule.

## 🎯 New Features

### 1. **Workout Builder Page**
- Edit any day's workout
- Change workout type (Full Body, Upper, Lower, Cardio)
- Add exercises from your library or templates
- Remove unwanted exercises
- Reorder exercises with up/down buttons
- See workout summary (total sets, estimated time)

### 2. **Exercise Selector Modal**
- Browse your custom exercises
- Browse default exercise templates
- Search exercises by name
- Filter by category
- Quick access to create new exercises

### 3. **Edit Buttons Everywhere**
- Edit button on Home page (Tab 1) - Edit today's workout
- Edit buttons on Workout Plan page (Tab 2) - Edit any day
- Add workout on rest days

## 📱 How to Use

### Edit Today's Workout

1. Go to **Home** (Tab 1)
2. Scroll to "Today's Workout" section
3. Click **"Edit Today's Workout"** button
4. You'll be taken to the Workout Builder for today

### Edit Any Day's Workout

1. Go to **Workout Plan** (Tab 2)
2. Find the day you want to edit
3. Click the **pencil icon** (✏️) on the day's card
4. You'll be taken to the Workout Builder for that day

### Add Workout on Rest Day

1. On a rest day, you'll see "Rest Day" card
2. Click **"Add Workout Today"** button
3. Start building your custom workout

## 🛠️ Workout Builder Features

### Change Workout Type

At the top of the Workout Builder, you can change the workout focus:
- **Full Body** - Compound full-body exercises
- **Upper Body** - Chest, back, arms, shoulders
- **Lower Body** - Legs, glutes, calves
- **Cardio** - Cardiovascular exercises

Just tap the button for the type you want.

### Add Exercises

1. Click **"Add Exercise"** button
2. A modal opens with two tabs:
   - **My Exercises** - Your custom exercises
   - **Templates** - Default exercise templates
3. Use the search bar to find specific exercises
4. Click on any exercise to add it to your workout
5. OR click **"Create New Exercise"** to add a new custom exercise

### Edit Exercise Details

1. Click the **pencil icon** (✏️) on any exercise
2. Modify:
   - Exercise name
   - Sets
   - Reps
   - Rest time (seconds)
3. Click **Save**

### Reorder Exercises

- Click **up arrow** (↑) to move exercise up
- Click **down arrow** (↓) to move exercise down
- The first exercise cannot move up
- The last exercise cannot move down

### Remove Exercise

1. Click the **trash icon** (🗑️) on any exercise
2. Confirm deletion
3. Exercise is removed from workout

### Delete Entire Workout

1. Click **trash icon** in top-right corner
2. Confirm deletion
3. That day becomes a rest day

## 💡 Workflow Examples

### Example 1: Customize Monday's Upper Body Workout

1. Go to Workout Plan (Tab 2)
2. Find Monday, click edit icon
3. Click "Add Exercise"
4. Select "My Exercises" tab
5. Add your custom exercises (e.g., Bench Press, Rows)
6. Reorder them as desired
7. Changes are automatically saved!

### Example 2: Add a Quick Cardio Session

1. On Home page, click "Edit Today's Workout"
2. Change workout type to **Cardio**
3. Click "Add Exercise"
4. Browse Templates
5. Add: Jumping Jacks, Burpees, High Knees
6. Adjust sets/reps if needed
7. Done!

### Example 3: Build Custom Leg Day

1. Go to Exercises page (from Settings)
2. Create custom exercises:
   - Bulgarian Split Squats (4×10)
   - Romanian Deadlifts (4×8)
   - Leg Press (3×15)
3. Go to Workout Plan, select Friday (or any day)
4. Click edit icon
5. Change focus to "Lower Body"
6. Add your custom leg exercises
7. Reorder them in your preferred sequence

## 📊 Workout Summary

At the bottom of the Workout Builder, you'll see:
- **Total exercises** in the workout
- **Total sets** across all exercises
- **Estimated time** (auto-calculated based on sets, reps, and rest)

## 💾 Auto-Save

All changes are **automatically saved** to local storage when you:
- Add an exercise
- Remove an exercise
- Reorder exercises
- Change workout focus
- Edit exercise details

No manual save button needed!

## 🔄 Integration with Custom Exercises

The Workout Builder seamlessly integrates with the Exercise Library:

1. **Add from Library**: Select exercises you've already created
2. **Create New**: Jump to exercise creation from the selector modal
3. **Templates Available**: Fall back to default exercises anytime
4. **Search & Filter**: Find exercises quickly by name or category

## 📐 Data Structure

### Updated Models

```typescript
interface WorkoutDay {
  dayOfWeek: number;        // 0-6 (Sunday-Saturday)
  focus: 'full' | 'upper' | 'lower' | 'cardio';
  exercises: Exercise[];
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  category?: 'full' | 'upper' | 'lower' | 'cardio' | 'custom';
}
```

### New PlanService Methods

- `updateWorkoutPlan(plan)` - Update entire workout plan
- `updateWorkoutDay(dayOfWeek, day)` - Update specific day
- `addExerciseToDay(dayOfWeek, exercise)` - Add exercise to day
- `removeExerciseFromDay(dayOfWeek, index)` - Remove exercise
- `updateExerciseInDay(dayOfWeek, index, exercise)` - Update exercise
- `reorderExercises(dayOfWeek, exercises)` - Reorder exercises
- `deleteWorkoutDay(dayOfWeek)` - Delete workout day
- `getWorkoutForDay(dayOfWeek)` - Get single day's workout

## 🎨 UI Components

### 1. Workout Builder Page (`/workout-builder`)
- Full-screen editor for single workout day
- Query param: `?day=1` (0-6 for Sunday-Saturday)
- Features: focus selector, exercise list, add/edit/delete/reorder

### 2. Exercise Selector Modal
- Modal overlay for selecting exercises
- Two tabs: Custom + Templates
- Search functionality
- Category filtering

## 🔗 Navigation

**Routes:**
- `/workout-builder?day=0` - Sunday
- `/workout-builder?day=1` - Monday
- `/workout-builder?day=2` - Tuesday
- `/workout-builder?day=3` - Wednesday
- `/workout-builder?day=4` - Thursday
- `/workout-builder?day=5` - Friday
- `/workout-builder?day=6` - Saturday

**Access Points:**
1. Home → "Edit Today's Workout"
2. Workout Plan → Day card → Edit icon
3. Rest day card → "Add Workout Today"

## 🚀 Testing on iPhone

### Test Checklist

- [ ] Edit today's workout from Home
- [ ] Edit different days from Workout Plan
- [ ] Add exercises from custom library
- [ ] Add exercises from templates
- [ ] Search for exercises
- [ ] Create new exercise from selector
- [ ] Edit exercise details
- [ ] Reorder exercises using arrows
- [ ] Remove exercises
- [ ] Change workout focus/type
- [ ] Delete entire workout day
- [ ] Add workout on rest day
- [ ] Verify auto-save (close app, reopen)
- [ ] Check workout summary calculations

## 💡 Tips & Best Practices

1. **Plan Ahead**: Build your week on Sunday
2. **Start Simple**: Use templates, customize later
3. **Save Favorites**: Create custom exercises for repeated use
4. **Progressive Overload**: Edit sets/reps as you get stronger
5. **Rest Days**: Don't feel obligated to work out every day
6. **Listen to Body**: Swap cardio for rest if needed

## 🛠️ Technical Details

### Files Created

**Workout Builder:**
- `/src/app/workout-builder/workout-builder.page.ts`
- `/src/app/workout-builder/workout-builder.page.html`
- `/src/app/workout-builder/workout-builder.page.scss`
- `/src/app/workout-builder/workout-builder.page.spec.ts`

**Exercise Selector Modal:**
- `/src/app/workout-builder/exercise-selector-modal/exercise-selector-modal.component.ts`
- `/src/app/workout-builder/exercise-selector-modal/exercise-selector-modal.component.html`
- `/src/app/workout-builder/exercise-selector-modal/exercise-selector-modal.component.scss`
- `/src/app/workout-builder/exercise-selector-modal/exercise-selector-modal.component.spec.ts`

### Files Modified

- `/src/app/services/plan.service.ts` - Added editing methods
- `/src/app/app-routing.module.ts` - Added workout-builder route
- `/src/app/tab2/tab2.page.html` - Added edit buttons
- `/src/app/tab2/tab2.page.ts` - Added editWorkout method
- `/src/app/tab2/tab2.page.scss` - Styled day-actions
- `/src/app/components/today-workout/today-workout.component.html` - Added edit button
- `/src/app/components/today-workout/today-workout.component.ts` - Added editWorkout method
- `/src/app/components/today-workout/today-workout.component.scss` - Styled button

## 🎉 What You Can Do Now

✅ **Fully customize** your weekly workout plan  
✅ **Add exercises** from your library or templates  
✅ **Edit exercises** on the fly  
✅ **Reorder exercises** to match your preference  
✅ **Change workout types** (upper, lower, full, cardio)  
✅ **Delete workouts** to create rest days  
✅ **Add workouts** to rest days  
✅ **See estimated time** for each workout  
✅ **Auto-save** all changes locally  
✅ **No API needed** - works completely offline  

---

**Ready to build your perfect workout plan!** 💪📱

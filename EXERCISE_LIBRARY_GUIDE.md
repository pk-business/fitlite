# Custom Exercise Library - User Guide

## Overview

The FitLite app now supports creating and managing custom exercises! You can build your own exercise library and the app will use your custom exercises in workout plans.

## Features

### ✅ What's Implemented

1. **Custom Exercise Management**
   - Create custom exercises with name, category, sets, reps, and rest time
   - Edit existing exercises
   - Delete exercises
   - View exercises organized by category

2. **Exercise Categories**
   - **Upper Body** - Chest, back, arms, shoulders
   - **Lower Body** - Legs, glutes, calves
   - **Full Body** - Compound movements
   - **Cardio** - Cardiovascular exercises
   - **Custom** - Any other exercise type

3. **Integration with Workout Plans**
   - Custom exercises automatically replace default exercises
   - If you create custom exercises for a category (e.g., "upper"), they will be used in that day's workout
   - Falls back to default exercises if no custom exercises exist

4. **Local Storage**
   - All exercises saved locally on your device
   - Works completely offline
   - No API required - perfect for iPhone testing

## How to Use

### Access Exercise Library

There are **3 ways** to access the Exercise Library:

1. **From Settings**
   - Tap Settings (Tab 3)
   - Scroll to "Workouts" section
   - Tap "Exercise Library"

2. **From Schedule/Reminders**
   - Tap Schedule (Tab 2)
   - Tap the barbell icon in the top-right corner

3. **Direct Navigation**
   - Navigate to `/exercises` route

### Create a Custom Exercise

1. Open Exercise Library
2. Tap the **+** icon in the top-right
3. Fill in the form:
   - **Exercise Name**: e.g., "Dumbbell Bench Press"
   - **Category**: Choose from Upper, Lower, Full, Cardio, or Custom
   - **Sets**: Number of sets (1-10)
   - **Reps**: Repetitions per set (1-100)
   - **Rest**: Rest time in seconds (10-300)
4. Tap "Add Exercise"

### Edit an Exercise

1. Find the exercise in the list
2. Tap the **pencil icon** (✏️)
3. Modify the values
4. Tap "Update Exercise"

### Delete an Exercise

1. Find the exercise in the list
2. Tap the **trash icon** (🗑️)
3. Confirm deletion

## How It Works

### Default vs Custom Exercises

- **Default Exercises**: Pre-defined exercises (Push-ups, Squats, etc.)
- **Custom Exercises**: Your own exercises stored in local storage

### Workout Plan Generation

When generating a workout plan:

1. For each workout day (e.g., Monday = Upper Body)
2. Check if custom exercises exist for that category
3. **If YES**: Use your custom exercises
4. **If NO**: Use default template exercises

### Example Workflow

**Scenario**: You want to create a custom upper body workout

1. Open Exercise Library
2. Add exercises with category "Upper Body":
   - Bench Press (4 sets × 8 reps, 90s rest)
   - Bent Over Rows (4 sets × 10 reps, 90s rest)
   - Overhead Press (3 sets × 10 reps, 60s rest)
   - Bicep Curls (3 sets × 12 reps, 45s rest)

3. Go to Profile and regenerate your plan
4. On your upper body days (Monday & Thursday), you'll see YOUR exercises instead of the defaults!

## Data Storage

All custom exercises are stored in:
- **Storage Key**: `custom_exercises`
- **Location**: Ionic Storage (IndexedDB on web, native on iOS)
- **Format**: Array of CustomExercise objects

## Models

### CustomExercise Interface

```typescript
{
  id: string;              // Unique identifier
  name: string;            // Exercise name
  category: string;        // upper, lower, full, cardio, custom
  sets: number;            // Number of sets
  reps: number;            // Repetitions
  restSeconds: number;     // Rest time
  isCustom: true;          // Always true for custom exercises
  createdAt: number;       // Timestamp
}
```

## Tips for iPhone Testing

1. **Start Simple**: Create 2-3 exercises per category
2. **Test Persistence**: Close app, reopen, verify exercises are still there
3. **Test Workout Integration**: 
   - Create custom exercises for "upper" category
   - Go to Home (Tab 1)
   - Check if Monday's workout shows your custom exercises
4. **Test CRUD**: Create, view, edit, and delete exercises

## Future Enhancements (Not Yet Implemented)

- [ ] Workout builder with drag-and-drop
- [ ] Save multiple workout routines
- [ ] Exercise history and progress tracking
- [ ] Import/export exercise library
- [ ] Exercise descriptions and instructions
- [ ] Exercise images/videos
- [ ] Share exercises with other users

## Troubleshooting

**Q: My custom exercises aren't showing in workouts**
- Make sure the exercise category matches the workout day focus
- Try regenerating your workout plan (go to Profile page)

**Q: I can't see my custom exercises**
- Check the Exercise Library page
- Pull to refresh
- Check browser console for errors

**Q: How do I reset everything?**
- Go to Settings → Data → Reset All Data
- This will delete profile, workouts, and custom exercises

## Technical Details

### Files Created/Modified

**New Files:**
- `/src/app/models/workout.model.ts` - Added CustomExercise interface
- `/src/app/services/exercise.service.ts` - CRUD operations
- `/src/app/exercises/exercises.page.ts` - UI component
- `/src/app/exercises/exercises.page.html` - Template
- `/src/app/exercises/exercises.page.scss` - Styles

**Modified Files:**
- `/src/app/services/plan.service.ts` - Integration with custom exercises
- `/src/app/app-routing.module.ts` - Added exercises route
- `/src/app/settings/settings.page.html` - Added Exercise Library link
- `/src/app/schedule/schedule.page.html` - Added exercises button

---

**Ready to test on your iPhone!** 📱💪

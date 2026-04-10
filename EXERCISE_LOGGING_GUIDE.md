# Exercise Logging Feature - User Guide

## Overview

The FitLite app now includes **Exercise Logging** - track your actual workout performance! Record weights, reps, and notes for every exercise to monitor your progress over time.

## 🎯 Key Features

### 1. **Exercise Notes Icon**
- Every exercise now has a **note/pencil icon** (📝)
- Icon color indicates logging status:
  - **Gray outline** - Not logged yet
  - **Green filled** - Already logged today

### 2. **Comprehensive Logging Modal**
- Track **actual weights** used
- Record **actual reps** performed
- Mark sets as **completed** with checkboxes
- Add **personal notes** about the workout
- See **real-time progress** and volume calculations

### 3. **Smart Features**
- **Copy Last Workout** - Quickly load previous session's data
- **Auto-calculation** - Volume (weight × reps) calculated automatically
- **Progress tracking** - Completion percentage displayed
- **Set management** - Add/remove sets on the fly

## 📱 How to Use

### Log an Exercise

1. **Find the Exercise**
   - Go to Home (Tab 1) - "Today's Workout"
   - OR go to Workout Plan (Tab 2) - Any day's workout

2. **Click the Note Icon**
   - Look for the pencil icon next to each exercise
   - Gray = not logged yet
   - Green = already logged

3. **Fill in Your Actual Performance**
   - **Weight**: Enter weight used (in kg)
   - **Reps**: Enter reps completed
   - **Checkbox**: Mark set as completed ✓
   - Repeat for each set

4. **Add Sets if Needed**
   - Click "Add Set" to add extra sets
   - Trash icon to remove sets

5. **Add Notes** (Optional)
   - "Felt strong today"
   - "Increase weight next time"
   - "Form needs work"

6. **Save**
   - Click "Save Log" button
   - Data saves to local storage

### Copy Previous Workout

Save time by copying your last session:

1. Open log modal for an exercise
2. Click **"Copy Last"** button
3. Previous workout data loads automatically
4. Adjust as needed (increase weight, etc.)
5. Save

### View Logged Exercises

- **Green icons** indicate exercises logged today
- All other exercises show gray outline
- Multiple logs per day allowed (morning/evening splits)

## 💡 Use Cases

### Track Progressive Overload

**Week 1:**
```
Bench Press
- Set 1: 60kg × 10 ✓
- Set 2: 60kg × 9 ✓
- Set 3: 60kg × 8 ✓
Notes: Good form
```

**Week 2:**
```
Bench Press (Click "Copy Last")
- Set 1: 62.5kg × 10 ✓
- Set 2: 62.5kg × 9 ✓
- Set 3: 60kg × 8 ✓
Notes: Increased weight!
```

### Track AMRAP Sets

```
Pull-ups
- Set 1: 0kg × 12 ✓
- Set 2: 0kg × 10 ✓
- Set 3: 0kg × 8 ✓ (AMRAP)
Notes: Beat last week by 1!
```

### Note Techniques

```
Squats
- Set 1: 80kg × 8 ✓
- Set 2: 80kg × 8 ✓
- Set 3: 80kg × 7 ✓
Notes: Trying wider stance, feels more stable
```

## 📊 Data Tracked

### Per Set:
- **Weight** (kg) - Optional, defaults to 0 for bodyweight
- **Reps** - Actual repetitions performed
- **Completed** - Boolean checkbox
- **Set Number** - Automatically numbered

### Per Exercise:
- **Exercise Name** - Automatically filled
- **Date** - Current date (YYYY-MM-DD)
- **Sets Array** - All sets with data
- **Notes** - Freeform text field
- **Timestamp** - For ordering

### Calculated Metrics:
- **Total Volume** = Σ(weight × reps) for all sets
- **Completion %** = (completed sets / total sets) × 100
- **Set Count** - Number of sets performed

## 🎨 Visual Indicators

### Icon States

| Icon | Meaning | Color |
|------|---------|-------|
| 📝 (outline) | Not logged | Gray |
| 📝 (filled) | Logged today | Green |

### Set Card States

| State | Visual |
|-------|--------|
| Not completed | White background, gray border |
| Completed ✓ | Green tint background, green border |

### Progress Bar

- Shows completion percentage
- Updates in real-time as you check sets
- Green color indicates progress

## 💾 Data Storage

### Storage Key
- `exercise_logs` - Array of all exercise logs

### Data Structure

```typescript
{
  id: "log_1234567890_abc123",
  exerciseName: "Bench Press",
  date: "2026-04-06",
  sets: [
    {
      setNumber: 1,
      reps: 10,
      weight: 60,
      completed: true
    },
    {
      setNumber: 2,
      reps: 9,
      weight: 60,
      completed: true
    }
  ],
  notes: "Good session!",
  timestamp: 1712419200000
}
```

### Persistence

- ✅ **Survives app restarts**
- ✅ **Survives phone reboots**
- ✅ **Survives app updates**
- ❌ **Lost on app uninstall**
- ❌ **Not synced to cloud** (local only)

## 🔧 Technical Details

### New Files Created

**Models:**
- `/src/app/models/exercise-log.model.ts` - ExerciseLog, SetLog interfaces

**Services:**
- `/src/app/services/exercise-log.service.ts` - CRUD operations, progress tracking

**Components:**
- `/src/app/components/exercise-log-modal/exercise-log-modal.component.ts`
- `/src/app/components/exercise-log-modal/exercise-log-modal.component.html`
- `/src/app/components/exercise-log-modal/exercise-log-modal.component.scss`

### Files Modified

- `/src/app/models/index.ts` - Export ExerciseLog models
- `/src/app/components/workout-day/workout-day.component.html` - Added note icons
- `/src/app/components/workout-day/workout-day.component.ts` - Added modal logic

### Service Methods

**ExerciseLogService:**
- `loadLogs()` - Load all logs from storage
- `addLog(log)` - Create new log entry
- `updateLog(id, updates)` - Update existing log
- `deleteLog(id)` - Delete a log
- `getLogsForExercise(name)` - Get logs for specific exercise
- `getLogsForDate(date)` - Get logs for specific date
- `getTodaysLogs()` - Get today's logs
- `getLastLogForExercise(name)` - Get most recent log
- `isLoggedToday(name)` - Check if logged today
- `getExerciseSummary(name)` - Get summary stats
- `getProgressData(name, days)` - Get progress over time

## 📈 Future Enhancements (Not Yet Implemented)

Potential features for future versions:

- [ ] **Progress Charts** - Visual graphs of weight progression
- [ ] **Personal Records** - Track PRs automatically
- [ ] **History View** - See all past workouts
- [ ] **Export Data** - CSV/JSON export
- [ ] **Rest Timer** - Built-in countdown timer
- [ ] **Plate Calculator** - Calculate barbell loading
- [ ] **1RM Calculator** - Estimate one-rep max
- [ ] **Deload Weeks** - Auto-suggest deload periods

## 💡 Tips & Best Practices

### 1. **Log Immediately**
- Log sets right after completing them
- Don't wait until end of workout
- Memory fades quickly!

### 2. **Be Honest**
- Record actual reps, not planned
- Don't inflate numbers
- Honesty = better progress tracking

### 3. **Use Notes Field**
- Document form cues that worked
- Note injuries or discomfort
- Track energy levels
- Record environment (gym was crowded, etc.)

### 4. **Progressive Overload**
- Review last workout before starting
- Aim to beat previous performance
- Small improvements add up!

### 5. **Rest Days**
- You won't see note icons on rest days
- Use the "Add Workout Today" button if needed

## 🚀 Testing Checklist

- [ ] Click note icon on an exercise
- [ ] Modal opens with exercise details
- [ ] Add weight and reps for sets
- [ ] Check sets as completed
- [ ] See progress bar update
- [ ] Add personal notes
- [ ] Save log
- [ ] Icon turns green
- [ ] Reopen modal - see saved data
- [ ] Click "Copy Last" with previous data
- [ ] Data loads correctly
- [ ] Add extra set
- [ ] Remove a set
- [ ] Close app and reopen
- [ ] Logs still there ✓

## 🎯 Example Workflow

**Monday - Upper Body Day**

1. Open app, see "Push-ups" in today's workout
2. Click gray note icon
3. Modal opens, shows: "Planned: 3 × 12"
4. Click "Copy Last" (loads from last Monday)
5. Previous data: 3 sets × 12 reps, bodyweight
6. Perform first set: 14 reps (beat it!)
7. Check set 1 as completed
8. Enter 14 reps
9. Complete remaining sets
10. Add note: "Felt strong, CNS fresh"
11. Save
12. Icon turns green ✓
13. Move to next exercise

**Thursday - Check Progress**

1. Click green icon on "Push-ups"
2. See Monday's data
3. Try to beat 14 reps
4. Record actual performance
5. Update notes
6. Save

---

**Track every rep, measure every gain!** 💪📊

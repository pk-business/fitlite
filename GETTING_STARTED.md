# 🚀 Getting Started with FitLite

Welcome! Your FitLite fitness app is now fully generated and ready to use. Follow these steps to get up and running.

## ⚠️ Important First Steps

The app has been generated with all the code ready, but you need to install the Capacitor plugins to resolve the import errors you're seeing.

### 1. Install Required Capacitor Plugins

Run these commands in your terminal:

```bash
npm install @capacitor/preferences @capacitor/local-notifications
```

This will resolve the import errors in:
- `storage.service.ts`
- `notification.service.ts`

### 2. Sync Capacitor

After installing the plugins, sync them:

```bash
npx cap sync
```

## 🏃 Run the App

### Development (Browser)
```bash
ionic serve
```

**Note**: Capacitor APIs (storage, notifications) won't work in the browser, but you can test the UI and navigation.

### iOS Simulator/Device
```bash
ionic build
npx cap sync ios
npx cap open ios
```

Then click Run in Xcode.

## 📱 What's Inside

Your app now includes:

### ✅ Data Models
- `UserProfile` - User information and goals
- `Exercise`, `WorkoutDay`, `WorkoutPlan` - Workout structures
- `Meal`, `DietDay`, `DietPlan` - Diet structures
- `Reminder`, `AppSettings` - Notification and settings

### ✅ Services
- `StorageService` - Local data persistence
- `UserProfileService` - Profile management & BMI/TDEE calculations
- `PlanService` - Workout & diet plan generation (rule-based)
- `NotificationService` - Local notifications
- `ScheduleService` - Reminder management

### ✅ Pages
- **Profile Page** (`/profile`) - User onboarding with form validation
- **Home Page** (`/tabs/home`) - Today's workout and meals overview
- **Workout Plan Page** (`/tabs/workouts`) - Weekly workout schedule
- **Diet Plan Page** (`/tabs/diet`) - Weekly meal plan with macros
- **Schedule Page** (`/schedule`) - Set workout and meal reminders
- **Settings Page** (`/settings`) - Edit profile, manage data, app settings

### ✅ Features
- 📊 BMI, BMR, TDEE calculations
- 💪 Rule-based workout plan generation
- 🍽️ Macro-calculated diet plans
- 🔔 Daily reminders for workouts and meals
- 💾 Local storage (all data stays on device)
- 🎨 Clean, modern Ionic UI
- ⚡ OnPush change detection for performance
- 📦 Lazy-loaded routes

## 🎯 App Flow

1. **First Launch** → Create Profile
2. **Profile Page** → Enter age, height, weight, gender, goal, activity level
3. **Plan Generation** → App generates personalized workout and diet plans
4. **Home Tab** → View today's workout and meals
5. **Workouts Tab** → Browse weekly workout schedule
6. **Diet Tab** → Browse weekly meal plan
7. **Settings** → Edit profile or manage reminders

## 📖 Important Documentation

We've created comprehensive documentation for you:

- **[README.md](README.md)** - Full project overview and features
- **[SETUP.md](SETUP.md)** - Detailed setup instructions and troubleshooting
- **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** - Complete architecture guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Developer quick reference

## 🛠️ Customization Guide

### Change App Colors
Edit `src/theme/variables.scss`:
```scss
:root {
  --ion-color-primary: #3880ff;  // Change this
  --ion-color-secondary: #3dc2ff; // And this
}
```

### Modify Workout Plan Logic
Edit `src/app/services/plan.service.ts`:
- `getWorkoutDaysByActivityLevel()` - Change workout frequency
- `getExercisesForFocus()` - Modify exercises
- `getSetsRepsForGoal()` - Adjust sets and reps

### Modify Diet Plan Logic
Edit `src/app/services/plan.service.ts`:
- `calculateMacros()` - Change macro ratios
- `generateDailyMeals()` - Adjust meal distribution

### Add New Exercises
In `plan.service.ts`, add to exercise arrays in `getExercisesForFocus()`.

## 🔧 Common Commands

```bash
# Development
npm start                    # or ionic serve

# Build
npm run build               # or ionic build

# Tests
npm test

# Lint
npm run lint

# iOS
npm run cap:run:ios         # Build, sync, and open Xcode

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## ✨ Key Features Explained

### Rule-Based Workout Generation
- **Low Activity**: 3 full-body workouts/week
- **Medium Activity**: 4 upper/lower split workouts/week
- **High Activity**: 5-6 workouts/week with cardio

### Macro Calculations
- **Lose Weight**: 35% protein, 40% carbs, 25% fat
- **Maintain**: 30% protein, 40% carbs, 30% fat
- **Gain Muscle**: 30% protein, 45% carbs, 25% fat

### Calorie Calculations
- Uses Mifflin-St Jeor equation for BMR
- Calculates TDEE based on activity level
- Adjusts for goals (±300-500 calories)

## 🐛 Troubleshooting

### Import Errors?
Run: `npm install @capacitor/preferences @capacitor/local-notifications`

### Module Not Found?
Run: `npm install` then `npx cap sync`

### iOS Build Issues?
1. Clean: `Product > Clean Build Folder` in Xcode
2. Update pods: `cd ios/App && pod install`
3. Resync: `npx cap sync ios`

### Data Not Persisting?
This only works on device/simulator, not in browser.

## 🎨 UI Components Used

The app uses Ionic's beautiful UI components:
- Cards for content sections
- Lists for items
- Forms with validation
- Tab navigation
- Ionic icons
- Toast notifications
- Alert dialogs
- Loading spinners

## 📱 Testing Checklist

Once the app is running, test these features:

- [ ] Create a user profile
- [ ] View generated workout plan
- [ ] View generated diet plan
- [ ] Check today's overview
- [ ] Set workout reminder
- [ ] Set meal reminders
- [ ] Edit profile
- [ ] Data persists after app restart
- [ ] Navigation works between all pages

## 🚢 Next Steps

1. ✅ Install Capacitor plugins (see step 1 above)
2. ✅ Run `ionic serve` to test in browser
3. ✅ Build for iOS: `ionic build && npx cap open ios`
4. ✅ Test all features on device
5. 🎨 Customize colors and theme
6. 💪 Add your own exercises
7. 📱 Deploy to App Store (if desired)

## 💡 Future Enhancement Ideas

Want to take the app further? Consider adding:
- Progress tracking (weight over time)
- Exercise videos or GIFs
- Custom exercise library
- Meal suggestions with recipes
- Integration with Apple Health
- Dark mode
- Multi-language support
- Social sharing
- Achievements/badges
- Workout timer

## 🤝 Need Help?

- Check [SETUP.md](SETUP.md) for detailed setup instructions
- See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for code examples
- Review [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) for architecture

## 📚 Learning Resources

- [Ionic Framework Docs](https://ionicframework.com/docs)
- [Angular Docs](https://angular.io/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎉 You're All Set!

Your lightweight fitness app is ready to go. Just install the Capacitor plugins and start building!

```bash
# Run this now:
npm install @capacitor/preferences @capacitor/local-notifications
npx cap sync
ionic serve
```

**Stay fit and keep coding!** 💪

---

Built with Angular + Ionic + Capacitor  
Made with ❤️ for your fitness journey

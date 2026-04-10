# FitLite - Lightweight Fitness App 💪

A simple, lightweight iPhone workout app built with **Angular**, **Ionic**, and **Capacitor**. FitLite provides personalized workout and diet plans based on your fitness goals, with local storage and daily reminders.

## 🎯 Features

- **User Profile Management**: Collect and store user physical info (age, height, weight, gender, goal, activity level)
- **Rule-Based Workout Plans**: Generate personalized workout plans based on activity level and goals
- **Rule-Based Diet Plans**: Create nutrition plans with calculated macros (protein, carbs, fat)
- **Today View**: Quick overview of today's workout and meals
- **Weekly Plans**: View complete workout and diet schedules for the week
- **Daily Reminders**: Set notifications for workouts and meals
- **Local Storage**: All data stored locally using Capacitor Preferences
- **Clean UI**: Modern, intuitive interface built with Ionic components

## 📱 Tech Stack

- **Framework**: Angular 20
- **UI Library**: Ionic 8
- **Mobile**: Capacitor 8
- **Storage**: @capacitor/preferences
- **Notifications**: @capacitor/local-notifications
- **Language**: TypeScript
- **Architecture**: Modular, lazy-loaded pages with OnPush change detection

## 📁 Project Structure

```
src/app/
├── models/                     # TypeScript interfaces
│   ├── user-profile.model.ts   # User profile data
│   ├── workout.model.ts        # Workout/exercise models
│   ├── diet.model.ts           # Diet/meal models
│   ├── reminder.model.ts       # Reminder & settings models
│   └── index.ts                # Barrel export
│
├── services/                   # Core services
│   ├── storage.service.ts      # Capacitor Preferences wrapper
│   ├── user-profile.service.ts # Profile management & calculations
│   ├── plan.service.ts         # Workout & diet plan generation
│   ├── notification.service.ts # Local notifications
│   └── schedule.service.ts     # Reminder scheduling
│
├── profile/                    # Profile setup/edit
│   ├── profile.page.ts
│   ├── profile.page.html
│   ├── profile.page.scss
│   ├── profile.module.ts
│   └── profile-routing.module.ts
│
├── tab1/ (Home)                # Today view
│   ├── tab1.page.ts            # Today's workout & meals
│   ├── tab1.page.html
│   └── tab1.page.scss
│
├── tab2/ (Workouts)            # Workout plan view
│   ├── tab2.page.ts            # Weekly workout schedule
│   ├── tab2.page.html
│   └── tab2.page.scss
│
├── tab3/ (Diet)                # Diet plan view
│   ├── tab3.page.ts            # Weekly meal schedule
│   ├── tab3.page.html
│   └── tab3.page.scss
│
├── schedule/                   # Reminder management
│   ├── schedule.page.ts
│   ├── schedule.page.html
│   └── schedule.page.scss
│
├── settings/                   # App settings
│   ├── settings.page.ts
│   ├── settings.page.html
│   └── settings.page.scss
│
├── tabs/                       # Tab navigation
│   ├── tabs.page.ts
│   ├── tabs.page.html
│   └── tabs-routing.module.ts
│
└── app-routing.module.ts       # Main routing
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Angular CLI: `npm install -g @angular/cli`
- Ionic CLI: `npm install -g @ionic/cli`
- Xcode (for iOS development)

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd fitlite
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Capacitor plugins**:
   ```bash
   npm install @capacitor/preferences @capacitor/local-notifications
   ```

4. **Sync Capacitor**:
   ```bash
   npx cap sync
   ```

5. **Run in browser** (development):
   ```bash
   ionic serve
   ```

6. **Build for iOS**:
   ```bash
   ionic build
   npx cap add ios
   npx cap open ios
   ```

## 🔧 Capacitor Plugin Configuration

### @capacitor/preferences
Used for local storage. No additional configuration required.

### @capacitor/local-notifications
Used for daily reminders.

**iOS Configuration** - Add to `ios/App/App/Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

Request permissions at runtime (handled in the app).

## 📖 App Flow

1. **First Launch**: User creates profile with personal info and goals
2. **Plan Generation**: App generates workout and diet plans based on profile
3. **Home Screen**: Shows today's workout and meals
4. **Navigation**: 
   - Tab 1 (Today): Daily overview
   - Tab 2 (Workouts): Weekly workout schedule
   - Tab 3 (Diet): Weekly meal plan
5. **Reminders**: Set daily notifications via Schedule page
6. **Settings**: Edit profile, manage data, app preferences

## 🏋️ Workout Plan Generation Logic

Plans are generated based on:
- **Activity Level**:
  - Low: 3 full-body workouts/week
  - Medium: 4 upper/lower split workouts/week
  - High: 5-6 workouts/week including cardio
- **Goal**:
  - Lose: Higher reps (15), moderate sets (3)
  - Maintain: Balanced (12 reps, 3 sets)
  - Gain: Lower reps (8), higher sets (4)

## 🍽️ Diet Plan Generation Logic

Nutrition calculated using:
- **BMR**: Basal Metabolic Rate (Mifflin-St Jeor Equation)
- **TDEE**: Total Daily Energy Expenditure (BMR × activity multiplier)
- **Target Calories**:
  - Lose: TDEE - 500 (0.5kg/week loss)
  - Maintain: TDEE
  - Gain: TDEE + 300 (lean muscle gain)
- **Macros**:
  - Lose: 35% protein, 40% carbs, 25% fat
  - Maintain: 30% protein, 40% carbs, 30% fat
  - Gain: 30% protein, 45% carbs, 25% fat

## 🎨 Design Principles

- **Lightweight**: Minimal dependencies, fast performance
- **Modular**: Small, focused components and services
- **Reactive**: RxJS observables for data flow
- **OnPush**: Optimized change detection
- **Lazy Loading**: Route-based code splitting
- **Type-Safe**: Full TypeScript coverage

## 📝 Key Services

### StorageService
Wrapper around Capacitor Preferences for key-value storage.

### UserProfileService
- Manages user profile data
- Calculates BMI, BMR, TDEE, target calories
- Provides observables for reactive updates

### PlanService
- Generates workout plans (rule-based)
- Generates diet plans (macro calculations)
- Stores plans locally

### NotificationService
- Schedules local notifications
- Manages notification permissions
- Supports daily repeating reminders

### ScheduleService
- Coordinates workout and meal reminders
- Manages app settings
- Integrates with NotificationService

## 🔐 Data Storage

All data is stored locally using Capacitor Preferences:
- `user_profile`: User profile data
- `workout_plan`: Weekly workout schedule
- `diet_plan`: Weekly meal plan
- `app_settings`: App preferences and reminder times

## 📱 Pages

### ProfilePage
Form to collect/edit user information. Generates plans on save.

### HomePage (Tab1)
Today's overview - current workout and meals with quick stats.

### WorkoutPlanPage (Tab2)
Weekly workout schedule with exercise details.

### DietPlanPage (Tab3)
Weekly meal plan with macros and calories.

### SchedulePage
Manage workout and meal reminders.

### SettingsPage
Edit profile, export data, reset app, view info.

## 🧪 Testing

Run unit tests:
```bash
npm test
```

## 🚢 Building for Production

```bash
ionic build --prod
npx cap sync
npx cap open ios
```

Then build and archive in Xcode.

## 📄 License

This project is open source and available for personal use.

## 🤝 Contributing

This is a personal project template. Feel free to fork and customize for your needs!

## 💡 Future Enhancements

- Progress tracking (weight, measurements)
- Exercise videos/GIFs
- Custom exercise library
- Meal suggestions with recipes
- Integration with health apps
- Dark mode support
- Multi-language support

---

Built with ❤️ and 💪 for your fitness journey!

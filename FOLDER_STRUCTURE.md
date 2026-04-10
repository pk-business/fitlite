# FitLite - Folder Structure & Architecture

## 📁 Complete Folder Structure

```
fitlite/
├── src/
│   ├── app/
│   │   ├── models/                    # Data Models (TypeScript Interfaces)
│   │   │   ├── user-profile.model.ts  # User profile interface
│   │   │   ├── workout.model.ts       # Exercise, WorkoutDay, WorkoutPlan
│   │   │   ├── diet.model.ts          # Meal, DietDay, DietPlan
│   │   │   ├── reminder.model.ts      # Reminder, AppSettings
│   │   │   └── index.ts               # Barrel export
│   │   │
│   │   ├── services/                  # Business Logic Services
│   │   │   ├── storage.service.ts     # Local storage wrapper
│   │   │   ├── user-profile.service.ts # Profile & calculations
│   │   │   ├── plan.service.ts        # Plan generation
│   │   │   ├── notification.service.ts # Notification management
│   │   │   └── schedule.service.ts    # Reminder scheduling
│   │   │
│   │   ├── profile/                   # Profile Page Module
│   │   │   ├── profile.page.ts        # Component logic
│   │   │   ├── profile.page.html      # Template
│   │   │   ├── profile.page.scss      # Styles
│   │   │   ├── profile.page.spec.ts   # Unit tests
│   │   │   ├── profile.module.ts      # NgModule
│   │   │   └── profile-routing.module.ts # Routing
│   │   │
│   │   ├── tab1/                      # Home Page (Today View)
│   │   │   ├── tab1.page.ts
│   │   │   ├── tab1.page.html
│   │   │   ├── tab1.page.scss
│   │   │   ├── tab1.page.spec.ts
│   │   │   ├── tab1.module.ts
│   │   │   └── tab1-routing.module.ts
│   │   │
│   │   ├── tab2/                      # Workout Plan Page
│   │   │   ├── tab2.page.ts
│   │   │   ├── tab2.page.html
│   │   │   ├── tab2.page.scss
│   │   │   ├── tab2.page.spec.ts
│   │   │   ├── tab2.module.ts
│   │   │   └── tab2-routing.module.ts
│   │   │
│   │   ├── tab3/                      # Diet Plan Page
│   │   │   ├── tab3.page.ts
│   │   │   ├── tab3.page.html
│   │   │   ├── tab3.page.scss
│   │   │   ├── tab3.page.spec.ts
│   │   │   ├── tab3.module.ts
│   │   │   └── tab3-routing.module.ts
│   │   │
│   │   ├── schedule/                  # Schedule Page Module
│   │   │   ├── schedule.page.ts
│   │   │   ├── schedule.page.html
│   │   │   ├── schedule.page.scss
│   │   │   ├── schedule.page.spec.ts
│   │   │   ├── schedule.module.ts
│   │   │   └── schedule-routing.module.ts
│   │   │
│   │   ├── settings/                  # Settings Page Module
│   │   │   ├── settings.page.ts
│   │   │   ├── settings.page.html
│   │   │   ├── settings.page.scss
│   │   │   ├── settings.page.spec.ts
│   │   │   ├── settings.module.ts
│   │   │   └── settings-routing.module.ts
│   │   │
│   │   ├── tabs/                      # Tab Navigation Module
│   │   │   ├── tabs.page.ts
│   │   │   ├── tabs.page.html
│   │   │   ├── tabs.page.scss
│   │   │   ├── tabs.page.spec.ts
│   │   │   ├── tabs.module.ts
│   │   │   └── tabs-routing.module.ts
│   │   │
│   │   ├── explore-container/         # Demo component (can be removed)
│   │   │
│   │   ├── app-routing.module.ts      # Main routing configuration
│   │   ├── app.component.ts           # Root component
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.component.spec.ts
│   │   └── app.module.ts              # Root module
│   │
│   ├── assets/                        # Static assets
│   │   └── icon/                      # App icons
│   │
│   ├── environments/                  # Environment configs
│   │   ├── environment.ts             # Development
│   │   └── environment.prod.ts        # Production
│   │
│   ├── theme/                         # Global styles
│   │   └── variables.scss             # CSS variables
│   │
│   ├── global.scss                    # Global styles
│   ├── index.html                     # HTML entry point
│   ├── main.ts                        # Angular bootstrap
│   ├── polyfills.ts                   # Browser polyfills
│   ├── test.ts                        # Test configuration
│   └── zone-flags.ts                  # Zone.js config
│
├── ios/                               # iOS project (after cap add ios)
├── android/                           # Android project (if added)
├── www/                               # Build output
├── node_modules/                      # Dependencies
│
├── angular.json                       # Angular CLI config
├── capacitor.config.json              # Capacitor config
├── ionic.config.json                  # Ionic CLI config
├── karma.conf.js                      # Test runner config
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
├── tsconfig.app.json                  # App TypeScript config
├── tsconfig.spec.json                 # Test TypeScript config
├── README.md                          # Project documentation
├── SETUP.md                           # Setup instructions
└── FOLDER_STRUCTURE.md                # This file
```

## 🏗️ Architecture Overview

### 1. Models Layer (`src/app/models/`)
**Purpose**: Define TypeScript interfaces for type safety

- `user-profile.model.ts`: User demographic and goal information
- `workout.model.ts`: Exercise and workout plan structures
- `diet.model.ts`: Meal and diet plan structures
- `reminder.model.ts`: Notification and app settings
- `index.ts`: Barrel export for clean imports

**Usage**:
```typescript
import { UserProfile, WorkoutPlan, DietPlan } from '../models';
```

### 2. Services Layer (`src/app/services/`)
**Purpose**: Business logic and data management

#### StorageService
- Wraps Capacitor Preferences API
- Provides async get/set/remove methods
- Handles JSON serialization

#### UserProfileService
- Manages user profile CRUD operations
- Calculates BMI, BMR, TDEE
- Provides reactive profile updates via BehaviorSubject

#### PlanService
- Generates workout plans (rule-based logic)
- Generates diet plans (macro calculations)
- Stores and retrieves plans from storage

#### NotificationService
- Manages local notification permissions
- Schedules repeating daily notifications
- Cancels notifications

#### ScheduleService
- Coordinates workout and meal reminders
- Manages app settings
- Integrates notification and storage services

**Service Injection**:
All services use `providedIn: 'root'` for singleton instances.

### 3. Pages Layer (`src/app/[page-name]/`)
**Purpose**: UI components with routing

#### Module Structure
Each page follows Angular module pattern:
- `*.page.ts`: Component logic (TypeScript)
- `*.page.html`: Template (HTML)
- `*.page.scss`: Styles (SCSS)
- `*.page.spec.ts`: Unit tests
- `*.module.ts`: NgModule declaration
- `*-routing.module.ts`: Routing configuration

#### Page Details

**ProfilePage** (`/profile`)
- User onboarding/profile editing
- Form validation with Reactive Forms
- Triggers plan generation on save

**HomePage** (`/tabs/home` - tab1)
- Today's workout and meals overview
- Quick stats (calories, protein)
- Empty state for new users
- Pull-to-refresh

**WorkoutPlanPage** (`/tabs/workouts` - tab2)
- Weekly workout schedule
- Exercise details (sets, reps, rest)
- Visual indicators for today
- Day-specific workout focus

**DietPlanPage** (`/tabs/diet` - tab3)
- Weekly meal plan
- Macro breakdown per day
- Nutrition tips
- Meal timing suggestions

**SchedulePage** (`/schedule`)
- Notification permission management
- Workout reminder settings
- Meal reminder settings (breakfast, lunch, dinner)
- View and edit reminder times

**SettingsPage** (`/settings`)
- View profile summary
- Edit profile
- Manage reminders link
- Toggle metric/imperial units
- Export data
- Reset all data
- About app info

### 4. Routing Structure

#### App Routing (`app-routing.module.ts`)
```typescript
/ -> TabsModule (default)
/profile -> ProfilePage
/schedule -> SchedulePage
/settings -> SettingsPage
```

#### Tabs Routing (`tabs-routing.module.ts`)
```typescript
/tabs/home -> Tab1Page (Home/Today)
/tabs/workouts -> Tab2Page (Workouts)
/tabs/diet -> Tab3Page (Diet)
```

### 5. Lazy Loading
All pages use lazy loading for optimal performance:
```typescript
loadChildren: () => import('./page/page.module').then(m => m.PageModule)
```

### 6. Change Detection Strategy
All pages use `OnPush` change detection:
```typescript
changeDetection: ChangeDetectionStrategy.OnPush
```

Manual change detection triggered via `ChangeDetectorRef.markForCheck()`.

## 🔄 Data Flow

### User Profile Flow
```
User Input (ProfilePage)
    ↓
UserProfileService.saveProfile()
    ↓
StorageService.set('user_profile')
    ↓
Capacitor Preferences API
    ↓
Local Storage (iOS/Android)
```

### Plan Generation Flow
```
Profile Saved
    ↓
PlanService.generateAllPlans()
    ↓
generateWorkoutPlan() + generateDietPlan()
    ↓
Rule-based calculations
    ↓
StorageService.set('workout_plan' | 'diet_plan')
    ↓
Local Storage
```

### Reminder Flow
```
User Sets Reminder (SchedulePage)
    ↓
ScheduleService.setWorkoutReminder()
    ↓
NotificationService.scheduleDailyReminder()
    ↓
Capacitor LocalNotifications API
    ↓
iOS Notification System
```

## 📦 Key Design Patterns

### 1. Service Layer Pattern
- All business logic in services
- Pages only handle UI and user interaction
- Services are injected via constructor

### 2. Repository Pattern
- StorageService abstracts storage mechanism
- Easy to swap storage implementation

### 3. Observable Pattern
- UserProfileService exposes `profile$` Observable
- Reactive updates across components

### 4. Lazy Loading Pattern
- Route-based code splitting
- Faster initial load time

### 5. OnPush Strategy
- Optimized change detection
- Better performance on mobile

## 🎯 Best Practices Applied

### TypeScript
✅ Strict type checking  
✅ Interfaces for all data models  
✅ Proper access modifiers (public/private)  
✅ Async/await for asynchronous operations  

### Angular
✅ Component-based architecture  
✅ Dependency injection  
✅ Reactive Forms for user input  
✅ Lazy loading modules  
✅ OnPush change detection  

### Ionic
✅ Native UI components  
✅ Platform-specific styling  
✅ Ionic navigation patterns  
✅ Ion loading/toast controllers  

### Capacitor
✅ Native API abstraction  
✅ Permission handling  
✅ Storage best practices  

## 🚀 Adding New Features

### To Add a New Page:
1. Generate with CLI: `ionic generate page new-page`
2. Add route to `app-routing.module.ts`
3. Create services if needed
4. Add navigation links

### To Add a New Service:
1. Generate: `ng generate service services/new-service`
2. Implement business logic
3. Add to `providedIn: 'root'`
4. Inject into components

### To Add a New Model:
1. Create interface in `models/new-model.model.ts`
2. Export from `models/index.ts`
3. Use in services and components

## 📊 File Size Guidelines

To keep the app lightweight:
- Components: < 300 lines
- Services: < 500 lines
- Templates: < 200 lines
- Models: < 100 lines

## 🧪 Testing Structure

```
*.spec.ts files alongside source files
karma.conf.js - Test runner configuration
test.ts - Test entry point
```

Run tests: `npm test`

## 📈 Scalability Considerations

Current structure supports:
- ✅ Adding more pages
- ✅ Adding more services
- ✅ Extending data models
- ✅ Adding shared components
- ✅ Multi-platform builds (iOS + Android)

## 🔍 Navigation Map

```
App Launch
    ↓
TabsPage (Bottom Navigation)
    ├── Tab 1: Home (Today View)
    │   └── Settings Button → SettingsPage
    │       ├── Edit Profile → ProfilePage
    │       └── Manage Reminders → SchedulePage
    │
    ├── Tab 2: Workouts (Weekly Plan)
    │
    └── Tab 3: Diet (Weekly Plan)
```

## 💡 Tips for Customization

1. **Change colors**: Edit `src/theme/variables.scss`
2. **Add new exercises**: Modify `PlanService.getExercisesForFocus()`
3. **Adjust macros**: Update `PlanService.calculateMacros()`
4. **Change plan logic**: Edit methods in `PlanService`
5. **Add new settings**: Extend `AppSettings` interface

---

This structure provides a clean, maintainable, and scalable foundation for your fitness app! 💪

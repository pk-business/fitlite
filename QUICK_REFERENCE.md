# FitLite - Developer Quick Reference

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Install Capacitor plugins
npm install @capacitor/preferences @capacitor/local-notifications

# Run in browser (development)
ionic serve

# Build for iOS
ionic build && npx cap sync ios && npx cap open ios

# Run tests
npm test

# Lint code
npm run lint
```

## 📦 Project Structure Quick Reference

```
src/app/
├── models/         # TypeScript interfaces
├── services/       # Business logic
├── tab1/          # Home page (Today view)
├── tab2/          # Workouts page
├── tab3/          # Diet page
├── profile/       # Profile setup
├── schedule/      # Reminders
└── settings/      # Settings
```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `app-routing.module.ts` | Main app routing |
| `tabs-routing.module.ts` | Tab navigation routing |
| `models/index.ts` | Data model exports |
| `services/*.service.ts` | Business logic services |
| `theme/variables.scss` | Color and theme variables |

## 📚 Data Models

### UserProfile
```typescript
{
  age: number;
  heightCm: number;
  weightKg: number;
  gender: 'male' | 'female' | 'other';
  goal: 'lose' | 'maintain' | 'gain';
  activityLevel: 'low' | 'medium' | 'high';
}
```

### Exercise
```typescript
{
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
}
```

### Meal
```typescript
{
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
```

## 🛠️ Service Methods

### StorageService
```typescript
await storage.set(key, value)       // Save data
await storage.get<T>(key)            // Retrieve data
await storage.remove(key)            // Delete key
await storage.clear()                // Clear all
```

### UserProfileService
```typescript
await userProfile.saveProfile(profile)       // Save profile
await userProfile.loadProfile()              // Load profile
await userProfile.hasProfile()               // Check if exists
userProfile.calculateBMI(profile)            // Calculate BMI
userProfile.calculateTDEE(profile)           // Calculate TDEE
userProfile.calculateTargetCalories(profile) // Get target cals
```

### PlanService
```typescript
await plan.generateWorkoutPlan(profile)  // Generate workout plan
await plan.generateDietPlan(profile)     // Generate diet plan
await plan.generateAllPlans(profile)     // Generate both
await plan.getWorkoutPlan()              // Get saved workout plan
await plan.getDietPlan()                 // Get saved diet plan
await plan.getTodaysWorkout()            // Get today's workout
await plan.getTodaysMeals()              // Get today's meals
```

### NotificationService
```typescript
await notification.requestPermission()                    // Request perms
await notification.checkPermissions()                     // Check perms
await notification.scheduleDailyReminder(id, title, body, hour, minute)
await notification.cancel(id)                             // Cancel one
await notification.cancelAll()                            // Cancel all
await notification.getPendingNotifications()              // Get pending
```

### ScheduleService
```typescript
await schedule.setWorkoutReminder(hour, minute)      // Set workout reminder
await schedule.setMealReminders(times[])             // Set meal reminders
await schedule.disableWorkoutReminder()              // Disable workout
await schedule.disableMealReminders()                // Disable meals
await schedule.disableAllReminders()                 // Disable all
await schedule.getSettings()                         // Get app settings
await schedule.updateSettings(settings)              // Update settings
await schedule.requestPermissions()                  // Request notification perms
```

## 🎨 Ionic Components Used

- `<ion-header>`, `<ion-toolbar>`, `<ion-title>`
- `<ion-content>`
- `<ion-card>`, `<ion-card-header>`, `<ion-card-content>`
- `<ion-list>`, `<ion-item>`, `<ion-label>`
- `<ion-input>`, `<ion-select>`, `<ion-toggle>`
- `<ion-button>`, `<ion-icon>`
- `<ion-spinner>`, `<ion-refresher>`
- `<ion-tabs>`, `<ion-tab-bar>`, `<ion-tab-button>`

## 🎯 Common Tasks

### Add a New Page
```bash
ionic generate page pages/new-page
```

Then add to `app-routing.module.ts`:
```typescript
{
  path: 'new-page',
  loadChildren: () => import('./pages/new-page/new-page.module').then(m => m.NewPageModule)
}
```

### Add a New Service
```bash
ng generate service services/new-service
```

### Add a New Model
1. Create `models/new-model.model.ts`
2. Export from `models/index.ts`

### Navigate Programmatically
```typescript
constructor(private router: Router) {}

this.router.navigate(['/tabs/home']);
```

### Show Toast
```typescript
constructor(private toastCtrl: ToastController) {}

const toast = await this.toastCtrl.create({
  message: 'Success!',
  duration: 2000,
  color: 'success'
});
await toast.present();
```

### Show Alert
```typescript
constructor(private alertCtrl: AlertController) {}

const alert = await this.alertCtrl.create({
  header: 'Confirm',
  message: 'Are you sure?',
  buttons: ['Cancel', 'OK']
});
await alert.present();
```

### Show Loading
```typescript
constructor(private loadingCtrl: LoadingController) {}

const loading = await this.loadingCtrl.create({
  message: 'Loading...'
});
await loading.present();
// ... do work
await loading.dismiss();
```

## 🔄 Reactive Forms

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

this.form = this.fb.group({
  name: ['', Validators.required],
  age: [25, [Validators.min(13), Validators.max(100)]]
});

// In template
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <ion-input formControlName="name"></ion-input>
</form>
```

## 📱 Capacitor APIs

### Storage (Preferences)
```typescript
import { Preferences } from '@capacitor/preferences';

await Preferences.set({ key: 'name', value: JSON.stringify(data) });
const { value } = await Preferences.get({ key: 'name' });
await Preferences.remove({ key: 'name' });
await Preferences.clear();
```

### Local Notifications
```typescript
import { LocalNotifications } from '@capacitor/local-notifications';

// Request permission
await LocalNotifications.requestPermissions();

// Schedule
await LocalNotifications.schedule({
  notifications: [{
    id: 1,
    title: 'Title',
    body: 'Message',
    schedule: { at: new Date(), every: 'day' }
  }]
});

// Cancel
await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
```

## 🎨 Theming

Edit `src/theme/variables.scss`:

```scss
:root {
  --ion-color-primary: #3880ff;
  --ion-color-secondary: #3dc2ff;
  --ion-color-tertiary: #5260ff;
  --ion-color-success: #2dd36f;
  --ion-color-warning: #ffc409;
  --ion-color-danger: #eb445a;
}
```

## 🐛 Debugging

### Browser DevTools
```bash
ionic serve
# Open Chrome DevTools (F12)
```

### iOS Simulator
```bash
ionic build
npx cap sync ios
npx cap open ios
# Safari > Develop > Simulator > inspect
```

### Check Logs
```typescript
console.log('Debug info:', data);
console.error('Error:', error);
```

## 📊 Performance Tips

1. Use `OnPush` change detection
2. Lazy load modules
3. Unsubscribe from observables
4. Use trackBy with ngFor
5. Minimize bundle size

## 🔒 Security Best Practices

1. Never store sensitive data in local storage
2. Validate all user inputs
3. Use TypeScript strict mode
4. Keep dependencies updated
5. Follow OWASP guidelines

## 📖 Useful Resources

- [Angular Docs](https://angular.io/docs)
- [Ionic Docs](https://ionicframework.com/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [RxJS Docs](https://rxjs.dev/)

## 🆘 Troubleshooting

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npx cap sync
```

### TypeScript Errors
Check `tsconfig.json` strict settings

### Capacitor Sync Issues
```bash
npx cap sync --force
```

### iOS Pod Issues
```bash
cd ios/App
pod update
pod install
```

---

Happy coding! 💪 Keep building!

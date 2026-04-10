# Theme System - Quick Start Guide

## 🎨 Two Beautiful Themes

Your app now has two complete themes that users can switch between:

### Blue Steel (Default)
- Cool, professional blue tones
- Perfect for masculine/neutral preference  
- Primary color: #3A7AFE

### Violet Pulse (Feminine)
- Warm, elegant violet tones
- Perfect for feminine preference
- Primary color: #A855F7

---

## 🚀 How Users Switch Themes

### Option 1: Via Settings (Recommended)
1. Open app
2. Navigate to **Settings** tab
3. Tap **App Theme** under Preferences
4. Select desired theme
5. Theme changes instantly!

### Option 2: Automatic by Gender
When users create their profile:
- Select **Female** → Violet Pulse applied automatically
- Select **Male/Other** → Blue Steel applied automatically

Users can always override this in Settings.

---

## 💻 For Developers

### Using Theme Colors

All components automatically inherit theme colors via CSS variables:

```scss
// ✅ CORRECT - Uses theme variables
.my-button {
  background: var(--theme-primary);
  color: var(--theme-primary-contrast);
  border: 1px solid var(--theme-border);
}

// ❌ WRONG - Hardcoded colors
.my-button {
  background: #3A7AFE; // Don't do this!
  color: white;
}
```

### Available Theme Variables

```scss
// Primary Colors
--theme-primary          // Main brand color
--theme-primary-dark     // Darker variant
--theme-primary-light    // Lighter variant

// Accent Colors
--theme-success          // Green (#4ADE80)
--theme-warning          // Yellow (#FACC15)
--theme-danger           // Red (#F87171)

// Backgrounds
--theme-background       // Page background
--theme-card             // Card/panel background
--theme-border           // Border color

// Text
--theme-text-primary     // Main text
--theme-text-secondary   // Secondary text

// Interactive States
--theme-hover            // Hover overlay
--theme-active           // Active/pressed state
--theme-shadow           // Shadow color

// Inputs
--theme-input-bg         // Input background
--theme-input-border     // Input border
--theme-input-focus      // Focused input border
```

### Programmatic Theme Switching

```typescript
import { ThemeService } from './services/theme.service';

constructor(private themeService: ThemeService) {}

// Apply specific theme
this.themeService.applyTheme('violet-pulse');

// Apply by gender
this.themeService.applyThemeByGender('female');

// Toggle between themes
this.themeService.toggleTheme();

// Get current theme
const current = this.themeService.getCurrentTheme(); // 'blue-steel' or 'violet-pulse'

// Check if feminine theme
if (this.themeService.isFeminineTheme()) {
  console.log('Violet Pulse active');
}
```

---

## 🎯 What's Been Updated

### ✅ Core Files

**Theme System:**
- `src/theme/themes.scss` - Complete theme definitions
- `src/app/services/theme.service.ts` - Theme management service
- `src/app/models/user-profile.model.ts` - Added theme property

**Component Styles (Updated to use theme variables):**
- Enhanced Workout Card
- Inline Set Logger
- Rest Timer
- Progress Graph
- Today Workout
- All Ionic component overrides

**UI Integration:**
- Settings page with theme selector
- App component for theme initialization
- Automatic theme persistence

---

## 🔍 Testing Both Themes

### Quick Test Steps:

1. **Start the app:**
   ```bash
   npm start
   ```

2. **View Blue Steel theme:**
   - Default on first load
   - Look for blue primary colors

3. **Switch to Violet Pulse:**
   - Go to Settings
   - Tap "App Theme"
   - Select "Violet Pulse"
   - Notice smooth color transition

4. **Verify components:**
   - ✅ Workout cards show theme colors
   - ✅ Buttons use primary color
   - ✅ Badges match theme
   - ✅ Progress graphs use theme
   - ✅ Timer uses theme colors
   - ✅ Text uses theme text colors

5. **Reload app:**
   - Theme should persist
   - No flash of wrong theme

---

## 📦 Files Modified/Created

### New Files:
- `src/theme/themes.scss`
- `THEME_SYSTEM.md` (this guide)
- `THEME_QUICKSTART.md` (documentation)

### Modified Files:
- `src/global.scss` - Import themes
- `src/app/services/theme.service.ts` - Complete rewrite
- `src/app/models/user-profile.model.ts` - Added theme property
- `src/app/app.component.ts` - Theme initialization
- `src/app/settings/settings.page.ts` - Theme selector
- `src/app/settings/settings.page.html` - Theme UI

### Component Styles Updated:
- `enhanced-workout-card.component.scss`
- `inline-set-logger.component.scss`
- `rest-timer.component.scss`
- `progress-graph.component.scss`
- `today-workout.component.scss`

---

## 🎨 Color Usage Guidelines

### When to Use Each Color:

**Primary (`--theme-primary`):**
- Buttons
- Active states
- Progress indicators
- Badges
- Links

**Success (`--theme-success`):**
- Completed actions
- Positive trends
- Checkmarks
- Success messages

**Warning (`--theme-warning`):**
- In-progress states
- Caution indicators
- Maintaining trends

**Danger (`--theme-danger`):**
- Delete actions
- Error states
- Declining trends
- Critical alerts

**Text Primary (`--theme-text-primary`):**
- Headings
- Body text
- Important labels

**Text Secondary (`--theme-text-secondary`):**
- Subtitles
- Helper text
- Metadata
- Icons

---

## 🚦 Status

✅ **Complete & Production Ready**

- Both themes fully implemented
- All components styled with theme variables
- Theme switcher in Settings
- Automatic persistence
- Gender-based auto-selection
- Smooth transitions
- No compilation errors

---

## 🎯 Next Steps (Optional Enhancements)

Future improvements you could add:

1. **Dark Mode Variants**
   - Blue Steel Dark
   - Violet Pulse Dark

2. **More Theme Options**
   - Coral Sunset
   - Emerald Forest
   - Gold Rush

3. **Custom Theme Builder**
   - Let users create their own

4. **Theme Preview**
   - Show preview before applying

5. **System Theme Sync**
   - Match OS light/dark mode

---

## 🎉 Try It Now!

Your dual-theme system is **live and ready**!

1. Open: http://localhost:4200
2. Navigate to Settings
3. Tap "App Theme"
4. Switch between themes and watch the magic! ✨

---

**Enjoy your beautiful new themes!** 🎨💪

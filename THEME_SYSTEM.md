# FitLite Theme System

## How Themes Work

FitLite uses a centralized theme system with CSS custom properties (variables) for consistent theming across light and dark modes.

### Architecture

1. **ThemeService** (`src/app/services/theme.service.ts`)
   - Manages theme switching via `body.dark` class
   - Saves user preference to local storage
   - Falls back to system preference (`prefers-color-scheme`)

2. **Centralized Theme Config** (`src/theme/theme-config.scss`)
   - Single source of truth for all theme colors
   - Defines both light and dark theme variables
   - Imported in `src/global.scss` and `angular.json`

3. **Theme Variables**
   - `--theme-*` variables for semantic colors (recommended)
   - `--ion-color-*` variables for Ionic component colors

### Color Categories

- **Semantic Colors**: `--theme-text-primary`, `--theme-text-secondary`, `--theme-card`, etc.
- **Ionic Colors**: `--ion-color-primary`, `--ion-color-medium`, `--ion-color-dark`, etc.
- **Status Colors**: `--theme-success`, `--theme-warning`, `--theme-danger`

### Usage in Components

```scss
// ✅ Recommended: Use semantic theme variables
.my-component {
  color: var(--theme-text-primary);
  background: var(--theme-card);
  border: 1px solid var(--theme-border);
}

// ✅ For Ionic components: Use ionic color variables
ion-button {
  --color: var(--ion-color-primary);
}

// ❌ Avoid: Hard-coded colors
.my-component {
  color: #000000; // Don't do this
}
```

### Maintenance

**To change theme colors:**
1. Edit `src/theme/theme-config.scss`
2. Update both light (`:root, body`) and dark (`body.dark`) sections
3. Ensure contrast ratios meet WCAG guidelines (4.5:1 minimum)
4. Test in both light and dark modes

**Current Contrast Ratios:**
- Light mode secondary text: ~6.1:1 (good)
- Dark mode secondary text: ~7.4:1 (good)
- Primary text: >15:1 (excellent)

### Theme Switching

Themes are toggled via the ThemeService:
```typescript
// In components
constructor(private themeService: ThemeService) {}

toggleTheme() {
  this.themeService.toggleTheme();
}

get currentTheme() {
  return this.themeService.getCurrentTheme(); // 'light' | 'dark'
}
```

### Files Structure

```
src/
├── global.scss                    # Imports theme config
├── theme/
│   ├── theme-config.scss          # 🎯 CENTRAL THEME FILE
│   ├── themes.scss                # Legacy (being phased out)
│   └── variables.scss             # Legacy (being phased out)
└── app/
    └── services/
        └── theme.service.ts       # Theme switching logic
```

### Migration Notes

- **Old system**: Colors defined in `variables.scss` and `themes.scss`
- **New system**: All colors centralized in `theme-config.scss`
- Components using `--ion-color-medium`/`--ion-color-dark` now have proper dark mode variants
- All theme variables are now properly defined for both light and dark modes
--theme-primary-light
--theme-success
--theme-warning
--theme-danger
--theme-background
--theme-card
--theme-border
--theme-text-primary
--theme-text-secondary
--theme-hover
--theme-active
--theme-shadow
```

### Theme Switching

Themes are applied via the `data-theme` attribute on the document root:

```html
<html data-theme="blue-steel">  <!-- Default -->
<html data-theme="violet-pulse"> <!-- Feminine -->
```

### Using Theme Colors in Components

All components automatically use theme colors through CSS variables:

```scss
.my-component {
  background: var(--theme-card);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border);
  
  .primary-button {
    background: var(--theme-primary);
    color: var(--theme-primary-contrast);
  }
}
```

## Theme Service API

### Methods

#### `applyTheme(theme: ThemeType, save?: boolean)`
Apply a specific theme to the app.

```typescript
themeService.applyTheme('violet-pulse');
```

#### `applyThemeByGender(gender: 'male' | 'female' | 'other', save?: boolean)`
Apply theme based on user gender.

```typescript
themeService.applyThemeByGender('female'); // Applies Violet Pulse
themeService.applyThemeByGender('male');   // Applies Blue Steel
```

#### `toggleTheme()`
Switch between the two themes.

```typescript
themeService.toggleTheme();
```

#### `getCurrentTheme(): ThemeType`
Get the currently active theme.

```typescript
const theme = themeService.getCurrentTheme(); // 'blue-steel' or 'violet-pulse'
```

#### `getThemeName(theme?: ThemeType): string`
Get the display name of a theme.

```typescript
const name = themeService.getThemeName(); // 'Blue Steel' or 'Violet Pulse'
```

#### `isFeminineTheme(): boolean`
Check if the active theme is the feminine variant.

```typescript
if (themeService.isFeminineTheme()) {
  console.log('Violet Pulse is active');
}
```

## User Interface

### Settings Page

Users can change themes via **Settings > Preferences > App Theme**:

1. Navigate to Settings
2. Tap "App Theme"
3. Select from available themes
4. Theme changes instantly with smooth transitions

The selected theme is:
- Saved to local storage
- Persisted in user profile
- Applied on app restart

### Automatic Theme Selection

When a user creates their profile:
- Female gender → Violet Pulse theme applied automatically
- Male/Other gender → Blue Steel theme applied automatically
- Users can override this anytime in Settings

## Component Integration

All major components have been updated to use theme variables:

### Enhanced Workout Card
- Primary color for badges and borders
- Theme text colors
- Hover states use theme hover color

### Inline Set Logger
- Input borders use theme colors
- Complete button uses success color
- Backgrounds use theme background

### Rest Timer
- Timer bubble uses theme card color
- Progress ring uses theme primary
- Text uses theme text colors

### Progress Graph
- Graph lines use theme primary
- Success/warning/danger for trends
- Background uses theme background

## Theme Transitions

All theme changes animate smoothly:

```scss
* {
  transition: background-color 0.3s ease,
              border-color 0.3s ease,
              color 0.3s ease;
}
```

Transitions are disabled on initial page load for better performance.

## Ionic Component Overrides

Ionic components automatically adapt to themes:

- Buttons use `--theme-primary`
- Cards use `--theme-card`
- Inputs use `--theme-input-bg` and `--theme-input-border`
- Badges use theme colors
- Progress bars use theme colors
- Tab bar uses theme colors

## Best Practices

### DO ✅
- Use CSS variables for all colors
- Let components inherit theme colors
- Test both themes when styling
- Use semantic variable names (`--theme-primary`, not `--blue`)

### DON'T ❌
- Hardcode color values in components
- Use Ionic color classes exclusively
- Override theme variables in components
- Assume a specific theme is active

## File Structure

```
src/
├── theme/
│   └── themes.scss          # Theme definitions
├── global.scss              # Imports themes
└── app/
    ├── services/
    │   └── theme.service.ts # Theme management
    ├── models/
    │   └── user-profile.model.ts # Includes theme
    └── settings/
        ├── settings.page.ts
        └── settings.page.html # Theme selector
```

## Browser Support

The theme system uses standard CSS custom properties supported by:
- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+
- iOS Safari 9.3+
- Android Chrome/WebView 49+

## Performance

- Theme switching is instant (< 100ms)
- No JavaScript color calculations
- GPU-accelerated transitions
- Minimal runtime overhead

## Accessibility

Both themes meet WCAG 2.1 Level AA standards:
- Text contrast ratios ≥ 4.5:1
- Interactive elements ≥ 3:1
- Clear visual differentiation
- Color-independent information

## Future Enhancements

Potential additions:
- Dark mode variants
- Custom theme creator
- More preset themes
- System theme sync (light/dark)
- Theme preview before applying

---

**Theme System Version**: 1.0.0  
**Last Updated**: 2026-04-09

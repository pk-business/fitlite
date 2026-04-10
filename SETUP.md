# FitLite Setup Guide

## Step-by-Step Installation Instructions

### 1. Install Capacitor Plugins

The app requires two Capacitor plugins. Install them using npm:

```bash
npm install @capacitor/preferences @capacitor/local-notifications
```

### 2. Update package.json (if needed)

Ensure your `package.json` includes these dependencies:

```json
{
  "dependencies": {
    "@capacitor/preferences": "^6.0.0",
    "@capacitor/local-notifications": "^6.0.0",
    "@capacitor/core": "^8.3.0",
    "@capacitor/cli": "^8.3.0"
  }
}
```

### 3. Sync Capacitor

After installing the plugins, sync them with your iOS project:

```bash
npx cap sync ios
```

### 4. iOS Configuration (Important!)

#### Configure Local Notifications

Open `ios/App/App/Info.plist` and add:

```xml
<key>NSUserNotificationsUsageDescription</key>
<string>FitLite needs notification permissions to send you workout and meal reminders</string>
```

#### Add Background Modes (Optional, for better notification delivery)

In Xcode:
1. Open the iOS project: `npx cap open ios`
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Background Modes"
6. Check "Remote notifications"

### 5. Run the App

#### Development (Browser)
```bash
ionic serve
```
Note: Capacitor plugins won't work in browser. Use device/simulator for full features.

#### iOS Simulator
```bash
ionic build
npx cap sync ios
npx cap open ios
```
Then run in Xcode simulator.

#### iOS Device
```bash
ionic build --prod
npx cap sync ios
npx cap open ios
```
Then:
1. Connect your iPhone
2. Select your device in Xcode
3. Configure signing in "Signing & Capabilities"
4. Click "Run" button

### 6. Verification Checklist

- [ ] App launches without errors
- [ ] Can create user profile
- [ ] Workout plan generates correctly
- [ ] Diet plan generates correctly
- [ ] Can navigate between tabs
- [ ] Can set reminders (shows permission prompt)
- [ ] Data persists after app restart
- [ ] Settings page loads profile data

## Common Issues & Solutions

### Issue: "@capacitor/preferences" not found
**Solution**: 
```bash
npm install --save @capacitor/preferences
npx cap sync
```

### Issue: "@capacitor/local-notifications" not found
**Solution**: 
```bash
npm install --save @capacitor/local-notifications
npx cap sync
```

### Issue: Notifications not working
**Solution**:
1. Check Info.plist has notification permission description
2. Ensure you granted permission when prompted
3. Verify plugin is installed: `npm list @capacitor/local-notifications`
4. Re-sync Capacitor: `npx cap sync ios`

### Issue: Data not persisting
**Solution**:
1. Verify @capacitor/preferences is installed
2. Check browser console for errors
3. Clear app data and retry
4. On device: Uninstall and reinstall app

### Issue: Build errors in Xcode
**Solution**:
1. Clean build folder: Product > Clean Build Folder
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
3. Re-sync: `npx cap sync ios`
4. Update CocoaPods: `cd ios/App && pod install`

### Issue: Module not found errors
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npx cap sync
```

## Testing on iOS Simulator

1. Build the project:
   ```bash
   ionic build
   npx cap sync ios
   ```

2. Open in Xcode:
   ```bash
   npx cap open ios
   ```

3. Select simulator (iPhone 14 or newer recommended)

4. Click Run button or press ⌘R

**Note**: Local notifications may not work perfectly in simulator. Test on real device for full functionality.

## Testing on iOS Device

### Requirements
- Apple Developer account (free or paid)
- Physical iPhone connected via USB
- Xcode configured with your Apple ID

### Steps
1. Connect iPhone to Mac
2. Open project in Xcode: `npx cap open ios`
3. Select your iPhone from device dropdown
4. Go to "Signing & Capabilities"
5. Select your Team (Apple ID)
6. Click Run (⌘R)
7. On first install: Trust developer on iPhone (Settings > General > VPN & Device Management)

## Environment-Specific Notes

### Development
- Use `ionic serve` for rapid development
- Capacitor APIs won't work (will log errors)
- UI and logic can be tested

### Staging/Testing
- Build with: `ionic build`
- Test on simulator for basic functionality
- Test on device for notifications and full features

### Production
- Build with: `ionic build --prod`
- Enable optimization settings
- Test thoroughly on device
- Archive and upload to App Store Connect

## Additional Capacitor Plugins (Future)

If you want to add more features:

### Camera Access
```bash
npm install @capacitor/camera
npx cap sync
```

### Filesystem
```bash
npm install @capacitor/filesystem
npx cap sync
```

### Share
```bash
npm install @capacitor/share
npx cap sync
```

### Haptics
```bash
npm install @capacitor/haptics
npx cap sync
```

## Scripts for package.json

Add these helpful scripts:

```json
{
  "scripts": {
    "start": "ionic serve",
    "build": "ionic build",
    "build:prod": "ionic build --prod",
    "cap:sync": "npx cap sync",
    "cap:open:ios": "npx cap open ios",
    "cap:run:ios": "ionic build && npx cap sync ios && npx cap open ios",
    "test": "ng test",
    "lint": "ng lint"
  }
}
```

Then you can run:
```bash
npm run cap:run:ios
```

## Next Steps

1. ✅ Install Capacitor plugins
2. ✅ Configure iOS permissions
3. ✅ Sync and build
4. ✅ Test on simulator
5. ✅ Test on device
6. 🎉 You're ready to work out!

## Support

For Capacitor issues, refer to:
- Capacitor Docs: https://capacitorjs.com/docs
- Ionic Docs: https://ionicframework.com/docs
- GitHub Issues: Check plugin repositories

---

Happy coding and stay fit! 💪

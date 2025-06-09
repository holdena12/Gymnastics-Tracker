# Firebase Setup for Cross-Device Authentication

This guide will help you set up Firebase for cross-device user authentication and data synchronization.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" 
3. Name it "Gymnastics Tracker" (or any name you prefer)
4. Disable Google Analytics (not needed for this app)
5. Click "Create project"

### Step 2: Enable Authentication
1. In your Firebase project, click "Authentication" in the left menu
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click "Email/Password"
5. Enable it and click "Save"

### Step 3: Enable Firestore Database
1. Click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location close to your users
5. Click "Done"

### Step 4: Get Your Config Keys
1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Name your app "Gymnastics Tracker Web"
6. Don't check "Set up Firebase Hosting"
7. Click "Register app"
8. **Copy the config object** (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Step 5: Update Your App
1. Open `src/firebase-config.js`
2. Replace the placeholder config with your real config:

```javascript
const firebaseConfig = {
  // Paste your real config here
  apiKey: "your-real-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Step 6: Install Dependencies
```bash
cd gymnastics-tracker
npm install firebase
```

### Step 7: Test It!
1. Start your app: `npm run dev`
2. Open `http://localhost:8001`
3. Create a new account with your email
4. Open the same URL on your phone
5. Sign in with the same email/password
6. Your account should work on both devices! 🎉

## 🔒 Security Rules (Optional but Recommended)

Replace your Firestore rules with these for better security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /userData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## ✨ Features You'll Get

✅ **Cross-device sync** - Create account on computer, sign in on phone  
✅ **Secure authentication** - Proper password handling  
✅ **Offline support** - Works offline, syncs when online  
✅ **Real-time updates** - Changes sync instantly across devices  
✅ **Data backup** - Your data is safely stored in the cloud  

## 🐛 Troubleshooting

**"Firebase not defined" error:**
- Make sure you ran `npm install firebase`
- Check that `firebase-config.js` has your real config

**"Permission denied" error:**
- Make sure Authentication is enabled in Firebase Console
- Check that Email/Password sign-in is enabled

**Can't sign in on mobile:**
- Ensure you're using the same Firebase project config
- Check that your mobile browser has internet connection

## 💡 Tips

- The Firebase config is safe to expose publicly (it's client-side)
- Your gymnastics data syncs automatically between devices
- You can sign in from multiple devices simultaneously
- The app works offline and syncs when you're back online

Need help? Check the Firebase Console for error logs in Authentication and Firestore sections. 
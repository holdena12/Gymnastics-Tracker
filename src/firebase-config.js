// Firebase Configuration for Gymnastics Skills Tracker
// This enables cross-device user authentication and data synchronization

// Firebase will be loaded via CDN script tags in HTML
// No ES6 imports needed for static hosting

// Firebase configuration
const firebaseConfig = {
  // These will be public in the frontend - that's normal for Firebase
  apiKey: "your-api-key-here",
  authDomain: "gymnastics-tracker.firebaseapp.com",
  projectId: "gymnastics-tracker",
  storageBucket: "gymnastics-tracker.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here"
};

// Initialize Firebase (will be called after scripts load)
let app, auth, db;

function initializeFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase not loaded. Make sure Firebase scripts are included.');
    return false;
  }
  
  // Initialize Firebase
  app = firebase.initializeApp(firebaseConfig);
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = firebase.auth();
  
  // Initialize Cloud Firestore and get a reference to the service
  db = firebase.firestore();
  
  console.log('Firebase initialized successfully');
  return true;
}

// Export for use in other modules
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.initializeFirebase = initializeFirebase; 
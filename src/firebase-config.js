// Firebase Configuration for Gymnastics Skills Tracker
// This enables cross-device user authentication and data synchronization

// Firebase will be loaded via CDN script tags in HTML
// No ES6 imports needed for static hosting

// Firebase configuration
const firebaseConfig = {
  // These will be public in the frontend - that's normal for Firebase
  apiKey: "AIzaSyBMLRHEddKQVNyPXS85ZTi2WdfswaSZfN0",
  authDomain: "gymnastics-tracker.firebaseapp.com",
  projectId: "gymnastics-tracker",
  storageBucket: "gymnastics-tracker.firebasestorage.app",
  messagingSenderId: "276755753225",
  appId: "1:276755753225:web:08299a5b5d0c2a14b50bd8",
  measurementId: "G-WXHN7DJ48R"
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
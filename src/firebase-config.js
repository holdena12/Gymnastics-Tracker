// Firebase Configuration for Gymnastics Skills Tracker
// This enables cross-device user authentication and data synchronization

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 
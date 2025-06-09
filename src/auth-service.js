// Authentication Service for Cross-Device User Management
// Handles Firebase Authentication and Firestore data sync

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from './firebase-config.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isOnline = navigator.onLine;
    this.localStorageBackup = true; // Keep localStorage as backup for offline use
    
    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.syncUserData();
      }
    });
  }

  // Create new user account
  async createAccount(email, password, fullName = '', gymnasticsLevel = '') {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, {
        displayName: fullName
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        fullName: fullName,
        gymnasticsLevel: gymnasticsLevel,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
      
      // Initialize empty data document
      await setDoc(doc(db, 'userData', user.uid), {
        routines: {},
        skills: {},
        lastUpdated: new Date().toISOString()
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Account creation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in existing user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date().toISOString()
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign out user
  async signOutUser() {
    try {
      await signOut(auth);
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Load user data from Firestore
  async loadUserData() {
    if (!this.currentUser) return null;
    
    try {
      const userDataDoc = await getDoc(doc(db, 'userData', this.currentUser.uid));
      if (userDataDoc.exists()) {
        const data = userDataDoc.data();
        
        // Merge with local data if offline backup is enabled
        if (this.localStorageBackup) {
          this.mergeWithLocalData(data);
        }
        
        return data;
      }
      return { routines: {}, skills: {}, lastUpdated: new Date().toISOString() };
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Fallback to localStorage if Firebase fails
      if (this.localStorageBackup) {
        return this.loadLocalData();
      }
      
      return null;
    }
  }

  // Save user data to Firestore
  async saveUserData(data) {
    if (!this.currentUser) return false;
    
    try {
      const dataWithTimestamp = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'userData', this.currentUser.uid), dataWithTimestamp);
      
      // Also save to localStorage as backup
      if (this.localStorageBackup) {
        localStorage.setItem(`gymnastics-data-${this.currentUser.email}`, JSON.stringify(dataWithTimestamp));
      }
      
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      
      // Fallback to localStorage if Firebase fails
      if (this.localStorageBackup) {
        localStorage.setItem(`gymnastics-data-${this.currentUser.email}`, JSON.stringify(data));
        return true;
      }
      
      return false;
    }
  }

  // Get user profile information
  async getUserProfile() {
    if (!this.currentUser) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(profileData) {
    if (!this.currentUser) return false;
    
    try {
      await updateDoc(doc(db, 'users', this.currentUser.uid), {
        ...profileData,
        lastUpdated: new Date().toISOString()
      });
      
      if (profileData.fullName) {
        await updateProfile(this.currentUser, {
          displayName: profileData.fullName
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Check if username is available (for backward compatibility)
  async isUsernameAvailable(username) {
    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  // Sync offline data when coming back online
  async syncOfflineData() {
    if (!this.currentUser || !this.localStorageBackup) return;
    
    try {
      const localData = this.loadLocalData();
      const cloudData = await this.loadUserData();
      
      if (localData && cloudData) {
        // Simple merge strategy - use most recent timestamp
        const localTimestamp = new Date(localData.lastUpdated || 0);
        const cloudTimestamp = new Date(cloudData.lastUpdated || 0);
        
        if (localTimestamp > cloudTimestamp) {
          // Local data is newer, upload to cloud
          await this.saveUserData(localData);
        }
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  // Sync user data between devices
  async syncUserData() {
    if (!this.currentUser) return;
    
    try {
      const cloudData = await this.loadUserData();
      if (cloudData) {
        // Update local storage with cloud data
        localStorage.setItem(`gymnastics-data-${this.currentUser.email}`, JSON.stringify(cloudData));
        
        // Trigger data reload in the main app
        window.dispatchEvent(new CustomEvent('userDataSynced', { detail: cloudData }));
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  }

  // Helper methods
  loadLocalData() {
    if (!this.currentUser) return null;
    
    const localData = localStorage.getItem(`gymnastics-data-${this.currentUser.email}`);
    return localData ? JSON.parse(localData) : null;
  }

  mergeWithLocalData(cloudData) {
    const localData = this.loadLocalData();
    if (!localData) return cloudData;
    
    // Simple merge - prefer cloud data but keep local changes if newer
    const localTimestamp = new Date(localData.lastUpdated || 0);
    const cloudTimestamp = new Date(cloudData.lastUpdated || 0);
    
    return localTimestamp > cloudTimestamp ? localData : cloudData;
  }

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };
    
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is signed in
  isSignedIn() {
    return !!this.currentUser;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService; 